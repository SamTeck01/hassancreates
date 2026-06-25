import { NextResponse } from "next/server";
import { PROJECTS_DATA } from "@/data/projects";

export async function GET() {
  try {
    // =========================================================================
    // DATABASE FETCH QUERY (Neon Postgres + Drizzle ORM)
    // =========================================================================
    const { db } = require("@/lib/db");
    const { projects } = require("@/lib/db/schema");
    
    let dbProjects = await db.select().from(projects);
    
    if (!dbProjects || dbProjects.length === 0) {
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
      dbProjects = await db.select().from(projects);
    }

    dbProjects.sort((a: any, b: any) => a.number.localeCompare(b.number));

    return NextResponse.json(dbProjects);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("TimeoutError") || msg.includes("fetch failed")) {
      console.log("Neon database connection timed out (offline mode) — falling back to static projects data.");
    } else {
      console.error("Error querying Neon database:", msg);
    }
    return NextResponse.json(PROJECTS_DATA);
  }
}
