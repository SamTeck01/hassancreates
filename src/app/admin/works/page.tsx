import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { PROJECTS_DATA } from "@/data/projects";
import WorksClient from "./WorksClient";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  let dbProjects: any[] = [];
  try {
    dbProjects = await db.select().from(projects);
    if (!dbProjects || dbProjects.length === 0) {
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
      dbProjects = await db.select().from(projects);
    }
    dbProjects.sort((a, b) => a.number.localeCompare(b.number));
  } catch {
    dbProjects = [...PROJECTS_DATA].sort((a, b) => a.number.localeCompare(b.number));
  }

  return <WorksClient initialProjects={dbProjects} />;
}
