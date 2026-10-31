import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
// DATABASE_URL is automatically loaded from env by Next.js in all environments.
type DB = NeonHttpDatabase<typeof schema>;
let dbInstance: DB | null = null;

function getDb(): DB {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    // Neon can take 2–5 s on a cold start; 8 s gives headroom without hanging
    // forever on an outage. The timeout MUST be created per request: a single
    // AbortSignal.timeout() made here would expire 8 s after the first query
    // and abort every query after it for the life of the server.
    neonConfig.fetchFunction = (url: string, init?: RequestInit) =>
      fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    const sql = neon(databaseUrl);
    dbInstance = drizzle(sql, { schema });
    return dbInstance;
  }

  // Safe mock instance to avoid crash during Next.js build-time collection of routes
  return new Proxy({} as DB, {
    get(_target, prop) {
      return () => {
        throw new Error(`Database connection string (DATABASE_URL) is not defined. Cannot call ${String(prop)}.`);
      };
    }
  });
}

export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const activeDb = getDb();
    const value = Reflect.get(activeDb, prop);
    if (typeof value === "function") {
      return value.bind(activeDb);
    }
    return value;
  }
});
