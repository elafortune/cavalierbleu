// Circuit d'import des contenus pédagogiques.
// Principe : tout est rattaché au NUMÉRO d'exercice (0825) ou au module ; un import peut être relancé
// sans risque (mise à jour, jamais de doublon) ; les réponses des élèves ne sont jamais touchées.
// Chaque import produit un rapport (ajouts, mises à jour, avertissements, erreurs).
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  correctionTemplates,
  courseDocuments,
  dossiers,
  exercises,
  importRuns,
  legacyAnswers,
  modules,
} from "@/db/schema";
import { CURRICULUM, dossierOfExercise, formatExerciseNumber } from "@/content/curriculum";
import { splitPgnGames, type GameTree } from "@/lib/chess/pgn";
import { putFile } from "@/lib/storage";
import { normalizeText } from "./text";

export type ImportReport = {
  kind: string;
  source: string;
  created: number;
  updated: number;
  unchanged: number;
  warnings: string[];
  errors: string[];
  items: string[];
};

const newReport = (kind: string, source: string): ImportReport => ({
  kind,
  source,
  created: 0,
  updated: 0,
  unchanged: 0,
  warnings: [],
  errors: [],
  items: [],
});

const sha1 = (s: string | Buffer) => createHash("sha1").update(s).digest("hex");

export async function logRun(db: Db, report: ImportReport) {
  await db.insert(importRuns).values({ kind: report.kind, report });
}

/* ------------------------------------------------------------------ */
/* Squelette : modules, dossiers, exercices « en attente »              */
/* ------------------------------------------------------------------ */

export async function seedCurriculum(db: Db): Promise<ImportReport> {
  const r = newReport("squelette", "src/content/curriculum.ts");
  for (const m of CURRICULUM) {
    await db
      .insert(modules)
      .values({ id: m.id, name: m.name, position: m.order, letter: m.letter })
      .onConflictDoUpdate({ target: modules.id, set: { name: m.name, position: m.order, letter: m.letter } });
    for (const [i, d] of m.dossiers.entries()) {
      const [row] = await db
        .insert(dossiers)
        .values({ moduleId: m.id, code: d.code, label: d.label, position: i + 1, firstExercise: d.from, lastExercise: d.to })
        .onConflictDoUpdate({
          target: [dossiers.moduleId, dossiers.code],
          set: { label: d.label, position: i + 1, firstExercise: d.from, lastExercise: d.to },
        })
        .returning({ id: dossiers.id });
      const values = [];
      for (let n = d.from; n <= d.to; n++) {
        values.push({ number: n, moduleId: m.id, dossierId: row.id, indexInDossier: n - d.from + 1 });
      }
      const inserted = await db.insert(exercises).values(values).onConflictDoNothing().returning({ n: exercises.number });
      r.created += inserted.length;
      r.unchanged += values.length - inserted.length;
    }
  }
  r.items.push(`${CURRICULUM.length} modules, ${CURRICULUM.reduce((a, m) => a + m.dossiers.length, 0)} dossiers.`);
  return r;
}

/* ------------------------------------------------------------------ */
/* Exercices PGN                                                       */
/* ------------------------------------------------------------------ */

/** Retrouve le numéro d'exercice d'une partie PGN. */
export function exerciseNumberOf(tree: GameTree, fileName?: string): number | null {
  const h = tree.headers;
  const candidates = [h.Exercise, h.Exercice, h.White, h.Black, h.Event, h.Round, fileName];
  // En-tête explicite d'abord.
  for (const v of [h.Exercise, h.Exercice]) if (v && /^\d{1,4}$/.test(v.trim())) return Number(v);
  // Référence ChessBase de Darko : « MV-0825 » (Module Vert, exercice 0825).
  for (const v of candidates) {
    const m = v && /\bM[A-Z]?\s*[-–]\s*(\d{3,4})\b/.exec(v);
    if (m) return Number(m[1]);
  }
  const m = fileName && /(?:^|[^\d])(\d{4})(?:[^\d]|$)/.exec(fileName);
  return m ? Number(m[1]) : null;
}

function defaultPrompt(tree: GameTree) {
  const side = tree.sideToMove === "w" ? "Blancs" : "Noirs";
  switch (tree.headers.Result) {
    case "1-0":
      return tree.sideToMove === "w" ? "Les Blancs jouent et gagnent." : "Trait aux Noirs. Les Blancs gagnent-ils ?";
    case "0-1":
      return tree.sideToMove === "b" ? "Les Noirs jouent et gagnent." : "Trait aux Blancs. Les Noirs gagnent-ils ?";
    case "1/2-1/2":
      return `Trait aux ${side}. Quelle est l'issue de la position ?`;
    default:
      return `Trait aux ${side}. Trouvez le meilleur plan.`;
  }
}

export async function importPgnText(
  db: Db,
  text: string,
  source: string,
  opts: { status?: "ready" | "sample"; moduleHint?: string } = {},
): Promise<ImportReport> {
  const r = newReport("pgn", source);
  const status = opts.status ?? "ready";
  let games: ReturnType<typeof splitPgnGames>;
  try {
    games = splitPgnGames(text);
  } catch (e) {
    r.errors.push(`Fichier illisible : ${(e as Error).message}`);
    return r;
  }
  if (!games.length) r.warnings.push("Aucune partie trouvée dans le fichier.");

  for (const [i, { tree, pgn }] of games.entries()) {
    const label = `partie ${i + 1}`;
    const number = exerciseNumberOf(tree, games.length === 1 ? source : undefined);
    if (number === null) {
      r.errors.push(`${label} : numéro d'exercice introuvable (en-tête [Exercise "0825"] ou « MV-0825 » attendu).`);
      continue;
    }
    const ref = formatExerciseNumber(number);
    const loc = dossierOfExercise(number);
    if (!loc) {
      r.errors.push(`${ref} : numéro hors de la numérotation connue des modules.`);
      continue;
    }
    if (opts.moduleHint && loc.module.id !== opts.moduleHint) {
      r.warnings.push(`${ref} : rangé dans « ${opts.moduleHint} » mais appartient au module ${loc.module.name}.`);
    }
    if (tree.errors.length) {
      r.errors.push(`${ref} : ${tree.errors.join(" ; ")}`);
      continue;
    }
    if (!tree.rootChildren.length) r.warnings.push(`${ref} : aucune solution (position seule).`);

    const themes = (tree.headers.Themes ?? tree.headers.Themes ?? "")
      .split(/[;,]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const values = {
      title: tree.headers.Title ?? tree.headers.Titre ?? null,
      prompt: tree.headers.Consigne ?? tree.headers.Prompt ?? defaultPrompt(tree),
      fen: tree.startFen,
      sideToMove: tree.sideToMove,
      referencePgn: pgn,
      themes,
      status,
      source,
      contentHash: sha1(pgn),
    };
    const [existing] = await db.select({ hash: exercises.contentHash, status: exercises.status }).from(exercises).where(eq(exercises.number, number));
    if (!existing) {
      r.errors.push(`${ref} : exercice absent du squelette (lancer d'abord npm run db:seed).`);
      continue;
    }
    // Un contenu d'exemple n'écrase jamais un contenu réel.
    if (status === "sample" && existing.status === "ready") {
      r.unchanged++;
      continue;
    }
    if (existing.hash === values.contentHash && existing.status === status) {
      r.unchanged++;
      continue;
    }
    await db.update(exercises).set(values).where(eq(exercises.number, number));
    if (existing.status === "placeholder") r.created++;
    else r.updated++;
    r.items.push(`${ref} (${loc.module.name}, ${loc.dossier.label}, n°${loc.index})`);
  }
  return r;
}

/* ------------------------------------------------------------------ */
/* Cours PDF                                                           */
/* ------------------------------------------------------------------ */

const titleFromFile = (f: string) =>
  path
    .basename(f, path.extname(f))
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function importCoursePdf(
  db: Db,
  moduleId: string,
  fileName: string,
  data: Buffer,
  opts: { isSample?: boolean; title?: string; position?: number } = {},
): Promise<ImportReport> {
  const r = newReport("cours", `${moduleId}/${fileName}`);
  if (!CURRICULUM.some((m) => m.id === moduleId)) {
    r.errors.push(`Module inconnu : ${moduleId}`);
    return r;
  }
  if (data.subarray(0, 5).toString() !== "%PDF-") {
    r.errors.push(`${fileName} n'est pas un PDF valide.`);
    return r;
  }
  // Rattachement facultatif à un dossier d'après le nom : « D1 », « N°3 », « dossier-12 », « DTC », « EXE ».
  const dm = /(?:^|[^a-z])(?:d|n°?|dossier[-_ ]?)(\d{1,2})(?:[^\d]|$)/i.exec(fileName);
  const special = /(?:^|[^a-z])(DTC|EXE)(?:[^a-z]|$)/i.exec(fileName)?.[1]?.toUpperCase();
  const code = special ?? (dm ? `N${Number(dm[1])}` : null);
  let dossierId: number | null = null;
  if (code) {
    const [d] = await db.select({ id: dossiers.id }).from(dossiers).where(and(eq(dossiers.moduleId, moduleId), eq(dossiers.code, code)));
    dossierId = d?.id ?? null;
  }
  const storageKey = `cours/${moduleId}/${fileName}`;
  await putFile(storageKey, data, "application/pdf");
  const [existing] = await db
    .select({ id: courseDocuments.id })
    .from(courseDocuments)
    .where(and(eq(courseDocuments.moduleId, moduleId), eq(courseDocuments.fileName, fileName)));
  const values = {
    moduleId,
    dossierId,
    title: opts.title ?? titleFromFile(fileName),
    fileName,
    storageKey,
    sizeBytes: data.length,
    position: opts.position ?? 0,
    isSample: Boolean(opts.isSample),
  };
  if (existing) {
    await db.update(courseDocuments).set(values).where(eq(courseDocuments.id, existing.id));
    r.updated++;
  } else {
    await db.insert(courseDocuments).values(values);
    r.created++;
  }
  r.items.push(`${values.title}${dossierId ? ` (dossier ${code})` : ""}`);
  return r;
}

/* ------------------------------------------------------------------ */
/* Corrections de Darko (Word / texte)                                  */
/* ------------------------------------------------------------------ */

export type ParsedCorrections = {
  exerciseNumber: number | null;
  templates: { label: string; body: string }[];
  answers: { tag: string; date: Date | null; exerciseNumber: number; text: string }[];
};

const parseLegacyDate = (s: string) => {
  // « 05:55 AM Wednesday October 21st, 2020 »
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)\s+\w+\s+(\w+)\s+(\d{1,2})\w*,\s*(\d{4})/i.exec(s);
  if (!m) return null;
  const d = new Date(`${m[4]} ${m[5]}, ${m[6]} ${m[1]}:${m[2]} ${m[3].toUpperCase()}`);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Lit le format du document « Corrections - légende - réponses des étudiants ». */
export function parseCorrectionsText(raw: string): ParsedCorrections {
  const text = normalizeText(raw);
  const exMatch = /\bM[A-Z]\s*[–-]\s*(\d{4})\b/.exec(text) ?? /\[exercice:\s*(\d{4})\]/.exec(text);
  const exerciseNumber = exMatch ? Number(exMatch[1]) : null;

  const templates: ParsedCorrections["templates"] = [];
  const tStart = text.search(/Les corrections adapt[ée]es/i);
  const aStart = text.search(/Les r[ée]ponses des [ée]tudiants/i);
  if (tStart >= 0) {
    const block = text.slice(tStart, aStart > tStart ? aStart : undefined);
    const parts = block.split(/\n\s*([A-Z])\)\s*\n/);
    for (let i = 1; i < parts.length; i += 2) {
      const body = parts[i + 1]?.replace(/\n{2,}/g, "\n").trim();
      if (body) templates.push({ label: parts[i], body });
    }
  }

  const answers: ParsedCorrections["answers"] = [];
  const re = /\[\s*(\d+)\s*\]\s*\[([^\]]*)\]\s*\[exercice:\s*(\d{3,4})\]([\s\S]*?)\[fin-\s*\d+\s*\]/g;
  let m: RegExpExecArray | null;
  const body = aStart >= 0 ? text.slice(aStart) : text;
  while ((m = re.exec(body))) {
    const t = m[4].replace(/\n{3,}/g, "\n\n").trim();
    if (t) answers.push({ tag: m[1], date: parseLegacyDate(m[2]), exerciseNumber: Number(m[3]), text: t });
  }
  return { exerciseNumber, templates, answers };
}

export async function importCorrections(db: Db, raw: string, source: string): Promise<ImportReport> {
  const r = newReport("corrections", source);
  const parsed = parseCorrectionsText(raw);
  const n = parsed.exerciseNumber;
  if (parsed.templates.length) {
    if (n === null) r.errors.push("Corrections types trouvées mais numéro d'exercice introuvable (« MV-0825 »).");
    else {
      for (const t of parsed.templates) {
        const res = await db
          .insert(correctionTemplates)
          .values({ exerciseNumber: n, label: t.label, body: t.body, source })
          .onConflictDoUpdate({
            target: [correctionTemplates.exerciseNumber, correctionTemplates.label],
            set: { body: t.body, source },
          })
          .returning({ id: correctionTemplates.id });
        if (res.length) r.updated++;
      }
      r.items.push(`${formatExerciseNumber(n)} : ${parsed.templates.length} corrections types (${parsed.templates.map((t) => t.label).join(", ")}).`);
    }
  } else r.warnings.push("Aucune correction type (A), B)…) trouvée.");

  let added = 0;
  for (const a of parsed.answers) {
    // Empreinte stable même si la réparation de l'encodage évolue : seuls les caractères ASCII comptent.
    const ascii = a.text.replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ");
    const hash = sha1(`${a.exerciseNumber}|${a.tag}|${a.date?.toISOString() ?? ""}|${ascii}`);
    const before = await db.select({ id: legacyAnswers.id }).from(legacyAnswers).where(eq(legacyAnswers.contentHash, hash));
    await db
      .insert(legacyAnswers)
      .values({ exerciseNumber: a.exerciseNumber, studentRef: a.tag, answeredAt: a.date, text: a.text, source, contentHash: hash })
      .onConflictDoUpdate({ target: legacyAnswers.contentHash, set: { text: a.text, source } });
    if (!before.length) added++;
  }
  r.created += added;
  r.unchanged += parsed.answers.length - added;
  if (parsed.answers.length) r.items.push(`${parsed.answers.length} réponses historiques lues (${added} nouvelles).`);
  return r;
}

export async function readCorrectionsFile(file: string): Promise<string> {
  if (file.toLowerCase().endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ path: file });
    return res.value;
  }
  return readFile(file, "utf8");
}

/* ------------------------------------------------------------------ */
/* Dossier d'arrivée                                                    */
/* ------------------------------------------------------------------ */

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...(await listFiles(p)));
    else out.push(p);
  }
  return out;
}

/**
 * Importe tout le contenu d'un dossier d'arrivée :
 *   modules/<module>/cours/*.pdf · **\/*.pgn · corrections/**\/*.docx|.md|.txt
 */
export async function importDirectory(db: Db, root: string, opts: { sample?: boolean } = {}): Promise<ImportReport[]> {
  const reports: ImportReport[] = [];
  const files = await listFiles(root);
  for (const file of files.sort()) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const ext = path.extname(file).toLowerCase();
    const moduleHint = /^modules\/([^/]+)\//.exec(rel)?.[1];
    if (ext === ".pgn") {
      reports.push(await importPgnText(db, await readFile(file, "utf8"), rel, { status: opts.sample ? "sample" : "ready", moduleHint }));
    } else if (ext === ".pdf") {
      if (!moduleHint) {
        reports.push({ ...newReport("cours", rel), errors: ["PDF hors d'un dossier modules/<module>/ : module inconnu."] });
        continue;
      }
      reports.push(await importCoursePdf(db, moduleHint, path.basename(file), await readFile(file), { isSample: opts.sample }));
    } else if ([".docx", ".md", ".txt"].includes(ext) && /(^|\/)corrections\//.test(rel)) {
      reports.push(await importCorrections(db, await readCorrectionsFile(file), rel));
    }
  }
  for (const r of reports) await logRun(db, r);
  return reports;
}

/** État d'avancement des contenus, par module. */
export async function contentStatus(db: Db) {
  return db
    .select({
      moduleId: exercises.moduleId,
      total: sql<number>`count(*)::int`,
      ready: sql<number>`count(*) filter (where ${exercises.status} = 'ready')::int`,
      sample: sql<number>`count(*) filter (where ${exercises.status} = 'sample')::int`,
      placeholder: sql<number>`count(*) filter (where ${exercises.status} = 'placeholder')::int`,
    })
    .from(exercises)
    .groupBy(exercises.moduleId);
}
