/**
 * Read a public Behance project page (server-side) and extract what the
 * portfolio needs. Pure parsing lives in parseBehanceHtml so it can be tested.
 */
export const BEHANCE_IMAGE_PREFIX = "https://mir-s3-cdn-cf.behance.net/";

export interface BehanceProjectData {
  url: string;
  title: string;
  description: string;
  year: string;
  tags: string[];
  cover: string | null;
  images: string[];
}

export function normaliseBehanceUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!/^(www\.)?behance\.net$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/gallery\/(\d+)(\/[^/?#]*)?/);
    if (!m) return null;
    return `https://www.behance.net/gallery/${m[1]}${m[2] ?? ""}`;
  } catch {
    return null;
  }
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function meta(html: string, prop: string): string {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decode(content).trim() : "";
}

const rank = (size: string) => (size === "fs" ? 1e6 : parseInt(size.match(/\d+/)?.[0] ?? "0", 10));

export function parseBehanceHtml(rawHtml: string, url: string): BehanceProjectData {
  // Image links can sit inside escaped JSON (\/ or /)
  const html = rawHtml.replace(/\\u002[Ff]/g, "/").replace(/\\\//g, "/");

  const best = new Map<string, { size: string; url: string }>();
  const re = /https:\/\/mir-s3-cdn-cf\.behance\.net\/project_modules\/([a-z0-9_]+)\/([A-Za-z0-9._-]+\.(?:png|jpe?g|gif|webp))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [full, size, file] = m;
    if (size === "source" || size === "disp") continue;
    const cur = best.get(file);
    if (!cur || rank(size) > rank(cur.size)) best.set(file, { size, url: full });
  }

  const title = (meta(html, "og:title") || html.match(/<title>([^<]*)<\/title>/i)?.[1] || "")
    .replace(/\s+on Behance\s*$/i, "").trim();
  const ts = html.match(/"published_?[Oo]n"\s*:\s*(\d{9,})/)?.[1];
  const tagBlock = html.match(/"tags"\s*:\s*\[([^\]]*)\]/)?.[1] ?? "";
  const tags = [...tagBlock.matchAll(/"title"\s*:\s*"([^"]{1,60})"/g)].map((t) => t[1]).slice(0, 8);
  const cover = meta(html, "og:image");

  return {
    url,
    title: decode(title),
    description: meta(html, "og:description"),
    year: ts ? String(new Date(Number(ts) * 1000).getUTCFullYear()) : "",
    tags: [...new Set(tags)],
    cover: cover.startsWith(BEHANCE_IMAGE_PREFIX) ? cover : null,
    images: [...best.values()].map((v) => v.url).slice(0, 30),
  };
}

export type FetchResult =
  | { ok: true; data: BehanceProjectData }
  | { ok: false; error: string };

export async function fetchBehanceProject(input: string): Promise<FetchResult> {
  const url = normaliseBehanceUrl(input);
  if (!url) return { ok: false, error: "That isn't a Behance project link. It should look like behance.net/gallery/123456/Project-Name." };
  let res: Response;
  try {
    // BEHANCE_BASE_URL is only set by the local test suite (mock server)
    const target = process.env.BEHANCE_BASE_URL ? url.replace("https://www.behance.net", process.env.BEHANCE_BASE_URL) : url;
    res = await fetch(target, {
      headers: { "User-Agent": "HassanCreates-Importer/1.0 (+https://www.hassancreates.design)", Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't reach Behance. Try again in a minute." };
  }
  if (res.status === 404) return { ok: false, error: "Behance says this project doesn't exist (or isn't public)." };
  if (!res.ok) return { ok: false, error: `Behance refused the request from the website's server (status ${res.status}).` };
  const data = parseBehanceHtml(await res.text(), url);
  if (!data.title && !data.images.length) return { ok: false, error: "Couldn't find a project on that page." };
  if (!data.images.length) return { ok: false, error: "Found the project but no images in it." };
  return { ok: true, data };
}

// ── Pasted / uploaded page source (no request to Behance at all) ──

export interface BehanceProfileProject {
  id: string;
  url: string;
  title: string;
  year: string;
  cover: string | null;
}

export type BehanceSourceResult =
  | { kind: "project"; data: BehanceProjectData }
  | { kind: "profile"; projects: BehanceProfileProject[] }
  | { kind: "none"; error: string };

function pickCover(node: Record<string, unknown>): string | null {
  const all = ((node.covers as { allAvailable?: { url?: string; type?: string; width?: number | null }[] } | undefined)?.allAvailable ?? [])
    .filter((c) => typeof c.url === "string" && c.url.startsWith(BEHANCE_IMAGE_PREFIX));
  const pref = ["/projects/max_808/", "/projects/808/", "/projects/404/"]; // /original/ redirects to a 404
  for (const p of pref) {
    const hit = all.find((c) => c.url!.includes(p));
    if (hit) return hit.url!;
  }
  return all.find((c) => !c.url!.includes("/original")  && !c.url!.includes("_webp/"))?.url ?? null;
}

/** Profile page source → its projects (newest layout first, as on Behance). */
export function parseBehanceProfile(rawHtml: string): BehanceProfileProject[] {
  const seen = new Map<string, BehanceProfileProject>();
  const add = (id: string, p: Omit<BehanceProfileProject, "id">) => { if (!seen.has(id)) seen.set(id, { id, ...p }); };

  // 1) The JSON state Behance embeds in the page
  const json = rawHtml.match(/<script[^>]*id=["']beconfig-store_state["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (json) {
    try {
      const walk = (v: unknown) => {
        if (Array.isArray(v)) { v.forEach(walk); return; }
        if (!v || typeof v !== "object") return;
        const o = v as Record<string, unknown>;
        if (o.__typename === "Project" && o.id && typeof o.name === "string" && o.covers) {
          const ts = Number(o.publishedOn);
          add(String(o.id), {
            url: normaliseBehanceUrl(String(o.url ?? "")) ?? `https://www.behance.net/gallery/${o.id}`,
            title: decode(o.name).trim(),
            year: ts ? String(new Date(ts * 1000).getUTCFullYear()) : "",
            cover: pickCover(o),
          });
        }
        Object.values(o).forEach(walk);
      };
      walk(JSON.parse(json));
    } catch { /* fall through to the page markup */ }
  }

  // 2) Fallback: the project cards in the page markup
  if (!seen.size) {
    const html = rawHtml.replace(/\\\//g, "/");
    const re = /href="(?:https:\/\/www\.behance\.net)?\/gallery\/(\d+)\/[^"]*"[^>]*title="Link to project - ([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const id = m[1];
      const img = html.match(new RegExp(`https://mir-s3-cdn-cf\\.behance\\.net/projects/(?:404|max_808|808)/[a-z0-9]*${id}\\.[A-Za-z0-9.,_-]+`))?.[0] ?? null;
      add(id, { url: `https://www.behance.net/gallery/${id}`, title: decode(m[2]).trim(), year: "", cover: img });
    }
  }
  return [...seen.values()].filter((p) => p.title);
}

/** Decide what was pasted: one project page, a profile page, or neither. */
export function parseBehanceSource(rawHtml: string): BehanceSourceResult {
  const html = typeof rawHtml === "string" ? rawHtml : "";
  if (!/behance/i.test(html)) return { kind: "none", error: "That doesn't look like a Behance page. Copy the whole page source (or upload the saved .html file)." };
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";
  const projectUrl = normaliseBehanceUrl(canonical);
  if (projectUrl) {
    const data = parseBehanceHtml(html, projectUrl);
    if (data.images.length) return { kind: "project", data };
  }
  const projects = parseBehanceProfile(html);
  if (projects.length) return { kind: "profile", projects };
  const loose = parseBehanceHtml(html, projectUrl ?? "");
  if (loose.images.length) return { kind: "project", data: loose };
  return { kind: "none", error: "Couldn't find any projects or images in that page. Make sure you copied the whole source." };
}
