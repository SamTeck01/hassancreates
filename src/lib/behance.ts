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
