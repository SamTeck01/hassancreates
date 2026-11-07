/**
 * "Import to HassanCreates" bookmarklet.
 *
 * Runs in the visitor's own browser on a behance.net page (Behance blocks
 * cloud servers, not people). On a profile page it reads every project link
 * that is loaded, fetches each project page (same site, so allowed), and pulls
 * the title, description, year and image links. Then it opens the admin
 * import page with that list in the URL fragment (never sent to any server
 * until the admin presses Import).
 */
const SOURCE = (target: string) => `(async () => {
  if (!/(^|\\.)behance\\.net$/.test(location.hostname)) { alert("Open a Behance profile or project page first, then tap this bookmark."); return; }
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;padding:14px 16px;border-radius:14px;background:#6B21D9;color:#fff;font:600 14px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.35)";
  document.body.appendChild(box);
  const say = (t) => { box.textContent = t; };
  const rank = (s) => s === "fs" ? 1e6 : parseInt((s.match(/\\d+/) || ["0"])[0], 10);
  const images = (raw) => {
    const html = raw.replace(/\\\\u002[Ff]/g, "/").replace(/\\\\\\\//g, "/");
    const re = /https:\\/\\/mir-s3-cdn-cf\\.behance\\.net\\/project_modules\\/([a-z0-9_]+)\\/([A-Za-z0-9._-]+\\.(?:png|jpe?g|gif|webp))/gi;
    const best = {}; let m;
    while ((m = re.exec(html))) {
      if (m[1] === "source" || m[1] === "disp") continue;
      const f = m[2];
      if (!best[f] || rank(m[1]) > rank(best[f].s)) best[f] = { s: m[1], u: m[0] };
    }
    return Object.values(best).map((x) => x.u).slice(0, 20);
  };
  const meta = (doc, p) => (doc.querySelector('meta[property="' + p + '"]') || {}).content || "";
  const read = async (url) => {
    const html = await (await fetch(url, { credentials: "include" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = (meta(doc, "og:title") || doc.title).replace(/\\s+on Behance\\s*$/i, "").trim();
    const ts = (html.match(/"published_?[Oo]n"\\s*:\\s*(\\d{9,})/) || [])[1];
    return { url: url.split("?")[0], title, description: meta(doc, "og:description").trim(), year: ts ? String(new Date(ts * 1000).getFullYear()) : "", images: images(html) };
  };
  try {
    let links;
    if (/\\/gallery\\/\\d+/.test(location.pathname)) links = [location.href];
    else links = [...new Set([...document.querySelectorAll('a[href*="/gallery/"]')].map((a) => a.href.split("?")[0]).filter((h) => /\\/gallery\\/\\d+\\//.test(h)))];
    if (!links.length) { say("No projects found on this page. Scroll down so they load, then tap the bookmark again."); return; }
    const out = [];
    for (let i = 0; i < links.length; i++) {
      say("Reading project " + (i + 1) + " of " + links.length + "…");
      try { const p = await read(links[i]); if (p.images.length) out.push(p); } catch (e) {}
    }
    if (!out.length) { say("Couldn't read any project images. Try opening one project and tapping the bookmark there."); return; }
    say("Opening your site with " + out.length + " project(s)…");
    location.href = ${JSON.stringify(target)} + "#" + encodeURIComponent(JSON.stringify(out));
  } catch (e) { say("Import failed: " + e.message); }
})();`;

export function behanceBookmarklet(siteOrigin: string): string {
  const code = SOURCE(`${siteOrigin}/admin/works/import`).replace(/\n\s*/g, " ");
  return "javascript:" + encodeURIComponent(code);
}

/** Shape the bookmarklet sends. */
export interface BehanceProject {
  url: string;
  title: string;
  description: string;
  year: string;
  images: string[];
}

export const BEHANCE_IMAGE_PREFIX = "https://mir-s3-cdn-cf.behance.net/";
