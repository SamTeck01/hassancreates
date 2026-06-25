"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { visitors } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function trackVisitor(ip: string, country?: string | null, city?: string | null) {
  // 1. Hash the IP using SHA-256 (preserves privacy, raw IP is never stored)
  const hash = crypto
    .createHash("sha256")
    .update(ip)
    .digest("hex");

  try {
    // 2. Check if already recorded in the database
    const existing = await db
      .select()
      .from(visitors)
      .where(eq(visitors.ip_hash, hash))
      .limit(1);

    if (existing.length > 0) return; // Already seen, skip inserting

    // 3. Get location details
    let finalCountry = country || "Unknown";
    let finalCity = city || "Unknown";

    // Only try querying ip-api if country is unknown AND we are not on a local IP
    const isLocalIp = ip === "127.0.0.1" || ip === "::1" || ip === "localhost" || ip.startsWith("192.168.") || ip.startsWith("10.");
    if (finalCountry === "Unknown" && !isLocalIp) {
      try {
        const res = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,city`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status !== "fail") {
            finalCountry = data.country ?? "Unknown";
            finalCity = data.city ?? "Unknown";
          }
        }
      } catch (e) {
        console.error("Failed to query geolocation API:", e);
      }
    }

    // 4. Insert new unique visitor record
    await db.insert(visitors).values({
      ip_hash: hash,
      country: finalCountry,
      city: finalCity,
    });
  } catch (error) {
    console.error("Failed to track visitor:", error);
  }
}

export async function getVisitors() {
  try {
    return await db
      .select()
      .from(visitors)
      .orderBy(desc(visitors.visited_at));
  } catch (error) {
    console.error("Failed to retrieve visitors:", error);
    return [];
  }
}
