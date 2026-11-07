import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Additive, idempotent schema upgrades, run once per server instance before
 * the projects table is used. Existing projects default to published.
 */
let ready: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = db
      .execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true`)
      .then(() => undefined)
      .catch((e) => {
        ready = null; // retry next time
        throw e;
      });
  }
  return ready;
}
