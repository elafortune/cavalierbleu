// Importe les contenus réels déposés dans le dossier d'arrivée (par défaut ./contenus, exclu de Git) :
//   contenus/modules/<module>/cours/*.pdf      → cours en ligne du module (stockage privé)
//   contenus/modules/<module>/exercices/*.pgn  → exercices (numéro lu dans l'en-tête, ex. « MV-0825 »)
//   contenus/corrections/**/*.docx|.md|.txt    → corrections types de Darko + réponses historiques
// Usage : npm run content:import [-- <dossier>]
import { existsSync } from "node:fs";
import { loadEnv } from "./env";
loadEnv();

async function main() {
  const dir = process.argv[2] ?? "contenus";
  if (!existsSync(dir)) {
    console.error(`Dossier introuvable : ${dir}`);
    process.exit(1);
  }
  const { getDb } = await import("../src/db");
  const { importDirectory, contentStatus } = await import("../src/lib/content/import");
  const db = getDb();
  const reports = await importDirectory(db, dir);
  if (!reports.length) console.log("Aucun fichier reconnu.");
  for (const r of reports) {
    console.log(`• [${r.kind}] ${r.source} : +${r.created} créés, ${r.updated} mis à jour, ${r.unchanged} inchangés`);
    for (const i of r.items.slice(0, 20)) console.log(`    ${i}`);
    if (r.items.length > 20) console.log(`    … ${r.items.length - 20} autres`);
    for (const w of r.warnings) console.log(`  ⚠ ${w}`);
    for (const e of r.errors) console.log(`  ✗ ${e}`);
  }
  console.log("\nÉtat des contenus :");
  for (const s of await contentStatus(db)) {
    console.log(`  ${s.moduleId.padEnd(10)} ${s.ready} réels · ${s.sample} exemples · ${s.placeholder} en attente / ${s.total}`);
  }
  process.exit(reports.some((r) => r.errors.length) ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
