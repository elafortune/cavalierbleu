// Crée le squelette (9 modules, dossiers, 2 396 exercices « en attente ») puis charge les contenus d'EXEMPLE
// (fixtures/) pour tester l'architecture. Relançable sans risque : un contenu réel n'est jamais écrasé.
//   npm run db:seed
import { readFile } from "node:fs/promises";
import { loadEnv } from "./env";
loadEnv();

async function main() {
  const { getDb } = await import("../src/db");
  const { seedCurriculum, importPgnText, importCoursePdf, logRun } = await import("../src/lib/content/import");
  const { makeSamplePdf } = await import("../src/lib/content/sample-pdf");
  const { CURRICULUM } = await import("../src/content/curriculum");
  const db = getDb();

  const reports = [await seedCurriculum(db)];
  reports.push(await importPgnText(db, await readFile("fixtures/exercices-exemple.pgn", "utf8"), "fixtures/exercices-exemple.pgn", { status: "sample" }));

  for (const m of CURRICULUM) {
    const pdf = makeSamplePdf(`${m.name} - cours (EXEMPLE)`, [
      "Document d'exemple : il sera remplace par le cours PDF reel du module.",
      "",
      "Institut Le Cavalier Bleu - GMI Darko Anic",
      `Exercices du module : ${m.dossiers.length ? `${m.dossiers[0].from} a ${m.dossiers[m.dossiers.length - 1].to}` : "a venir"}`,
    ]);
    reports.push(await importCoursePdf(db, m.id, "exemple-cours.pdf", pdf, { isSample: true, title: `Cours du ${m.name} (exemple)` }));
  }

  for (const r of reports) {
    await logRun(db, r);
    console.log(`• ${r.kind} ${r.source} : +${r.created} créés, ${r.updated} mis à jour, ${r.unchanged} inchangés`);
    for (const w of r.warnings) console.log(`  ⚠ ${w}`);
    for (const e of r.errors) console.log(`  ✗ ${e}`);
  }
  process.exit(reports.some((r) => r.errors.length) ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
