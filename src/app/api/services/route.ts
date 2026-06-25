import { NextResponse } from "next/server";
import { SERVICES_DATA } from "@/data/services";

export async function GET() {
  try {
    // =========================================================================
    // DATABASE FETCH QUERY (Neon Postgres + Drizzle ORM)
    // =========================================================================
    const { db } = require("@/lib/db");
    const { services } = require("@/lib/db/schema");
    
    let dbServices = await db.select().from(services);
    
    if (!dbServices || dbServices.length === 0) {
      console.log("Database services table is empty, seeding with initial services...");
      for (const s of SERVICES_DATA) {
        await db.insert(services).values({
          id: s.id,
          num: s.num,
          title: s.title,
          count: s.count,
          description: s.description,
          image1: s.image1,
          image2: s.image2,
        });
      }
      dbServices = await db.select().from(services);
    }

    return NextResponse.json(dbServices);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("TimeoutError") || msg.includes("fetch failed")) {
      console.log("Neon database connection timed out (offline mode) — falling back to static services data.");
    } else {
      console.error("Error querying Neon database:", msg);
    }
    return NextResponse.json(SERVICES_DATA);
  }
}
