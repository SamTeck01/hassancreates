import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

const SITE_URL = "https://hassancreates.design";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects().catch(() => []);
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
