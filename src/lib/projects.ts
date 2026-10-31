import { PROJECTS_DATA } from "@/data/projects";
import type { Project } from "@/types";

/**
 * Loads projects from Neon (seeding on first run). Falls back to the static
 * data if the DB is unreachable. Shared by the home page (server render) and
 * /api/projects.
 */
type ProjectRow = typeof import("@/lib/db/schema").projects.$inferSelect;

/** DB rows use `null` for an empty bg srcset; the app type uses `undefined`. */
export function rowToProject(r: ProjectRow): Project {
  return { ...r, bgSrcSet: r.bgSrcSet ?? undefined };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { db } = await import("@/lib/db");
    const { projects } = await import("@/lib/db/schema");

    let rows = await db.select().from(projects);

    if (!rows || rows.length === 0) {
      console.log("Database projects table is empty, seeding with initial projects...");
      for (const p of PROJECTS_DATA) {
        await db.insert(projects).values({
          id: p.id,
          number: p.number,
          clientName: p.clientName,
          year: p.year,
          role: p.role,
          services: p.services,
          description: p.description,
          tagline: p.tagline,
          href: p.href,
          coverImage: p.coverImage,
          coverSrcSet: p.coverSrcSet || `${p.coverImage} 1024w`,
          swiperImages: p.swiperImages || [p.coverImage],
          imageCaptions: p.imageCaptions || ["Project showcase image."],
          bgImage: p.bgImage || p.coverImage,
          bgSrcSet: p.bgSrcSet || `${p.bgImage || p.coverImage} 2048w`,
        });
      }
      rows = await db.select().from(projects);
    }

    return rows.map(rowToProject).sort((a, b) => a.number.localeCompare(b.number));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("TimeoutError") || msg.includes("fetch failed")) {
      console.log("Neon database unreachable — falling back to static projects data.");
    } else {
      console.error("Error querying Neon database:", msg);
    }
    return PROJECTS_DATA;
  }
}
