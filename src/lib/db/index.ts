import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

let dbInstance: any = null;

function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, "utf-8");
      envFile.split("\n").forEach((line) => {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    // Ignore error loading env
  }
}

function getDb() {
  if (dbInstance) return dbInstance;

  // Try loading env vars if not present
  if (!process.env.DATABASE_URL) {
    loadEnvLocal();
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const sql = neon(databaseUrl);
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
