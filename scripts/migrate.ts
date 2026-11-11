// Applique les migrations SQL du dossier drizzle/ sur la base courante.
// Sans DATABASE_URL : base locale PGlite (.data/pglite). Arrêter `next dev` avant.
import { loadEnv } from "./env";
loadEnv();

async function main() {
  const { getDb, usingPglite } = await import("../src/db");
  const db = getDb();
  const migrationsFolder = "drizzle";
  if (usingPglite()) {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as never, { migrationsFolder });
  } else {
    const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
    await migrate(db as never, { migrationsFolder });
  }
  console.log(`Migrations appliquées (${usingPglite() ? "PGlite local" : "Neon"}).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
