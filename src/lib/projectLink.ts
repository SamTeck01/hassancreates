/**
 * Turn whatever was typed in "Project link" into a real external URL, or null
 * if there is no real link (so no "View Project" button leads to a 404).
 *   "https://x.com"  → "https://x.com"
 *   "morphllm.com" / "./morphllm.com" / "www.x.com/path" → "https://…"
 *   "#", "", "./works/stance", "/works/x" → null (old template pages that don't exist)
 */
export function projectLink(href: string | null | undefined): string | null {
  const h = (href ?? "").trim();
  if (!h || h === "#") return null;
  if (/^https?:\/\/[^\s]+\.[^\s]+/i.test(h)) return h;
  const bare = h.replace(/^\.?\//, "");
  if (/^works\//i.test(bare)) return null;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(bare)) return `https://${bare}`;
  return null;
}
