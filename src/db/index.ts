// Connexion à la base de données.
// - Production / préproduction : Postgres Neon (variable DATABASE_URL, ajoutée par l'intégration Vercel).
// - Développement sans DATABASE_URL : Postgres embarqué (PGlite) stocké dans .data/pglite — aucun service à installer.
//   ⚠️ PGlite n'accepte qu'un processus à la fois : arrêter `next dev` avant de lancer un script `npm run db:*`.
import { Pool, neonConfig } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export const PGLITE_DIR = path.join(process.cwd(), ".data", "pglite");
export const usingPglite = () => !process.env.DATABASE_URL;

function create(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    if (typeof WebSocket !== "undefined") neonConfig.webSocketConstructor = WebSocket;
    return drizzleNeon({ client: new Pool({ connectionString: url }), schema }) as unknown as Db;
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL manquante : connecter une base Neon au projet Vercel.");
  }
  mkdirSync(PGLITE_DIR, { recursive: true });
  return drizzlePglite({ client: new PGlite(PGLITE_DIR), schema }) as unknown as Db;
}

// Une seule instance par processus (le rechargement à chaud de Next réévalue les modules).
// Création paresseuse : rien ne se connecte tant qu'aucune requête n'est faite (build sans base possible).
const g = globalThis as unknown as { __cbDb?: Db };
export const getDb = (): Db => g.__cbDb ?? (g.__cbDb = create());
export const db: Db = new Proxy({} as Db, {
  get: (_t, prop) => {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export { schema };
