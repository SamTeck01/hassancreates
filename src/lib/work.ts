import type { Project } from "@/types";
import { projectLink } from "@/lib/projectLink";

/** Gallery images for a project page: the gallery, else the cover. */
export function projectImages(p: Project): string[] {
  const list = (p.swiperImages ?? []).filter(Boolean);
  return list.length ? list : [p.coverImage];
}

/** Behance / live link, when the project has a real one. */
export const externalLink = (p: Project) => projectLink(p.href);

export const isBehance = (url: string | null) => !!url && /behance\.net/i.test(url);

/** Cloudinary: ask for a resized, auto-format copy (keeps other hosts untouched). */
export function sized(url: string, w: number): string {
  return url.includes("res.cloudinary.com/") && url.includes("/upload/") && !/\/upload\/[^/]*w_\d+/.test(url)
    ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`)
    : url;
}

/** Disciplines across all projects, most used first (for the filter). */
export function disciplines(projects: Project[]): string[] {
  const n = new Map<string, number>();
  for (const p of projects) for (const s of p.services) {
    const k = s.trim().replace(/\.$/, "");
    if (k && k.length <= 24) n.set(k, (n.get(k) ?? 0) + 1);
  }
  return [...n.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 6);
}
