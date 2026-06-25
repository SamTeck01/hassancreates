import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
// DATABASE_URL is automatically loaded from env by Next.js in all environments.
let dbInstance: any = null;

function getDb() {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const sql = neon(databaseUrl, {
      fetchOptions: {
        signal: AbortSignal.timeout(1500),
      },
    });
    dbInstance = drizzle(sql, { schema });
    return dbInstance;
  }

  // Safe mock instance to avoid crash during Next.js build-time collection of routes
  return new Proxy({} as any, {
    get(target, prop) {
      return () => {
        throw new Error(`Database connection string (DATABASE_URL) is not defined. Cannot call ${String(prop)}.`);
      };
    }
  });
}

export const db = new Proxy({} as any, {
  get(target, prop) {
    const activeDb = getDb();
    const value = activeDb[prop];
    if (typeof value === "function") {
      return value.bind(activeDb);
    }
    return value;
  }
});
