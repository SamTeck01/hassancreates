import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { SERVICES_DATA } from "@/data/services";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let dbServices: any[] = [];
  try {
    dbServices = await db.select().from(services);
    if (!dbServices || dbServices.length === 0) {
      for (const s of SERVICES_DATA) {
        await db.insert(services).values({
          id: s.id, num: s.num, title: s.title,
          count: s.count, description: s.description,
          image1: s.image1, image2: s.image2,
        });
      }
      dbServices = await db.select().from(services);
    }
  } catch {
    dbServices = SERVICES_DATA;
  }

  return <ServicesClient initialServices={dbServices} />;
}
