import { defineConfig } from "drizzle-kit";

// Génération des migrations SQL à partir de src/db/schema.ts : `npm run db:generate`.
// Les migrations sont appliquées par `npm run db:migrate` (Neon ou PGlite selon DATABASE_URL).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "camelCase",
});
