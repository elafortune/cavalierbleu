// Cycle de vie d'une réponse : envoi → vérification automatique → brouillon IA (si activée)
// → relecture par Darko → publication à l'élève. Chaque relecture alimente la base d'expertise.
import { randomUUID } from "node:crypto";
import { and, arrayOverlaps, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { attempts, correctionTemplates, corrections, exercises, expertise, user } from "@/db/schema";
import { buildCorrectionPrompt, CORRECTION_SYSTEM, parseAiCorrection, type PromptExample } from "@/lib/ai/correction-prompt";
import { getLlmProvider } from "@/lib/ai/provider";
import { checkAnswer, type AutoCheck, type Grade } from "@/lib/chess/check";
import { extractLinesFromText, sanToFrench } from "@/lib/chess/french";
import { allLines, parseSinglePgn, playLine } from "@/lib/chess/pgn";
import { sendMail } from "@/lib/email";

export const GRADES: Grade[] = ["+", "-", "!?", "?!", "?"];

/** Lignes de coups d'une réponse : échiquier (PGN) + coups reconnus dans le texte. */
export function answerLines(fen: string, answerPgn: string | null, answerText: string | null): string[][] {
  const lines: string[][] = [];
  if (answerPgn?.trim()) {
    try {
      const t = parseSinglePgn(answerPgn);
      if (t.startFen.split(" ").slice(0, 4).join(" ") === fen.split(" ").slice(0, 4).join(" ")) {
        for (const l of allLines(t)) lines.push(l.map((id) => t.nodes[id].san));
      }
    } catch {
      /* PGN invalide : ignoré, le texte reste analysé */
    }
  }
  if (answerText?.trim()) {
    for (const l of extractLinesFromText(fen, answerText)) {
      const k = l.join(" ");
      if (!lines.some((x) => x.join(" ").startsWith(k))) lines.push(l);
    }
  }
  return lines.filter((l) => playLine(fen, l));
}

export const describeAnswer = (text: string | null, lines: string[][]) =>
  [text?.trim(), lines.length ? `Coups : ${lines.map((l) => l.map(sanToFrench).join(" ")).join(" | ")}` : ""].filter(Boolean).join("\n");

export class SubmitError extends Error {}

export async function submitAttempt(userId: string, exerciseNumber: number, answerPgn: string | null, answerText: string | null) {
  const [ex] = await db.select().from(exercises).where(eq(exercises.number, exerciseNumber));
  if (!ex || !ex.fen || !ex.referencePgn) throw new SubmitError("Cet exercice n'est pas encore disponible.");
  const text = answerText?.trim().slice(0, 8000) || null;
  const pgn = answerPgn?.trim().slice(0, 20000) || null;
  const lines = answerLines(ex.fen, pgn, text);
  if (!lines.length && !text) throw new SubmitError("Jouez au moins un coup sur l'échiquier ou rédigez votre réponse.");

  const auto = checkAnswer(parseSinglePgn(ex.referencePgn), lines);
  const id = randomUUID();
  await db.insert(attempts).values({ id, userId, exerciseNumber, answerPgn: pgn, answerText: text });
  const [c] = await db
    .insert(corrections)
    .values({ attemptId: id, status: "checked", autoCheck: auto, suggestedGrade: auto.suggestedGrade })
    .returning({ id: corrections.id });
  return { attemptId: id, correctionId: c.id, autoCheck: auto };
}

/* ------------------------------------------------------------------ */
/* Contexte pour l'IA                                                   */
/* ------------------------------------------------------------------ */

async function promptContext(correctionId: number) {
  const [row] = await db
    .select({ c: corrections, a: attempts, ex: exercises })
    .from(corrections)
    .innerJoin(attempts, eq(attempts.id, corrections.attemptId))
    .innerJoin(exercises, eq(exercises.number, attempts.exerciseNumber))
    .where(eq(corrections.id, correctionId));
  if (!row || !row.ex.fen || !row.ex.referencePgn) return null;
  const { c, a, ex } = row;
  const fen = ex.fen;
  const referencePgn = ex.referencePgn;
  if (!fen || !referencePgn) return null;

  const templates = await db
    .select({ label: correctionTemplates.label, body: correctionTemplates.body })
    .from(correctionTemplates)
    .where(eq(correctionTemplates.exerciseNumber, ex.number))
    .orderBy(correctionTemplates.label);

  // Consignes : globales, de l'exercice, ou d'un de ses thèmes.
  const guideRows = await db
    .select({ text: expertise.text })
    .from(expertise)
    .where(
      and(
        eq(expertise.kind, "guideline"),
        eq(expertise.active, true),
        or(
          eq(expertise.scope, "global"),
          eq(expertise.exerciseNumber, ex.number),
          ex.themes.length ? inArray(expertise.theme, ex.themes) : undefined,
        ),
      ),
    )
    .orderBy(desc(expertise.createdAt))
    .limit(15);

  // Exemples : d'abord le même exercice (corrections modifiées par Darko en priorité), puis même thème.
  const sameEx = await db
    .select()
    .from(expertise)
    .where(and(eq(expertise.kind, "example"), eq(expertise.active, true), eq(expertise.exerciseNumber, ex.number)))
    .orderBy(desc(expertise.edited), desc(expertise.createdAt))
    .limit(4);
  let sameTheme: (typeof sameEx)[number][] = [];
  if (sameEx.length < 4 && ex.themes.length) {
    sameTheme = await db
      .select({ e: expertise })
      .from(expertise)
      .innerJoin(exercises, eq(exercises.number, expertise.exerciseNumber))
      .where(and(eq(expertise.kind, "example"), eq(expertise.active, true), arrayOverlaps(exercises.themes, ex.themes)))
      .orderBy(desc(expertise.edited), desc(expertise.createdAt))
      .limit(4 - sameEx.length)
      .then((rows) => rows.map((r) => r.e).filter((e) => e.exerciseNumber !== ex.number));
  }
  const examples: PromptExample[] = [...sameEx, ...sameTheme].map((e) => ({ studentAnswer: e.studentAnswer ?? "", grade: e.grade, text: e.text }));

  const lines = answerLines(fen, a.answerPgn, a.answerText);
  const auto = (c.autoCheck as AutoCheck) ?? checkAnswer(parseSinglePgn(referencePgn), lines);
  const user = buildCorrectionPrompt({
    exercise: { number: ex.number, prompt: ex.prompt, fen, referencePgn, themes: ex.themes },
    templates,
    guidelines: guideRows.map((g) => g.text),
    examples,
    answer: { text: a.answerText, lines },
    autoCheck: auto,
  });
  return { system: CORRECTION_SYSTEM, user, correction: c };
}

export async function previewPrompt(correctionId: number) {
  const ctx = await promptContext(correctionId);
  return ctx ? `${ctx.system}\n\n---\n\n${ctx.user}` : null;
}

/** Rédige le brouillon IA d'une correction (sans effet si l'IA n'est pas configurée). */
export async function generateAiDraft(correctionId: number): Promise<{ ok: boolean; error?: string }> {
  const provider = getLlmProvider();
  if (!provider) return { ok: false, error: "IA non configurée" };
  const ctx = await promptContext(correctionId);
  if (!ctx) return { ok: false, error: "Correction introuvable" };
  if (ctx.correction.status === "published") return { ok: false, error: "Déjà publiée" };
  try {
    const res = await provider.generateJson({ system: ctx.system, user: ctx.user });
    const ai = parseAiCorrection(res.text);
    await db
      .update(corrections)
      .set({
        aiGrade: ai.grade,
        aiText: ai.advice ? `${ai.feedback}\n\nConseil : ${ai.advice}` : ai.feedback,
        aiModel: `${provider.name}:${res.model}`,
        aiError: null,
        status: "ai_draft",
      })
      .where(eq(corrections.id, correctionId));
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message.slice(0, 500);
    await db.update(corrections).set({ aiError: msg }).where(eq(corrections.id, correctionId));
    return { ok: false, error: msg };
  }
}

/* ------------------------------------------------------------------ */
/* Relecture par Darko                                                  */
/* ------------------------------------------------------------------ */

export async function publishCorrection(
  reviewerId: string,
  correctionId: number,
  input: { grade: Grade; text: string; guideline?: { text: string; scope: "exercise" | "theme" | "global"; theme?: string } },
) {
  const [row] = await db
    .select({ c: corrections, a: attempts, ex: exercises, u: user })
    .from(corrections)
    .innerJoin(attempts, eq(attempts.id, corrections.attemptId))
    .innerJoin(exercises, eq(exercises.number, attempts.exerciseNumber))
    .innerJoin(user, eq(user.id, attempts.userId))
    .where(eq(corrections.id, correctionId));
  if (!row) throw new Error("Correction introuvable");
  const { c, a, ex, u } = row;
  const text = input.text.trim();
  const edited = c.aiText ? text !== c.aiText.trim() || input.grade !== c.aiGrade : null;

  await db
    .update(corrections)
    .set({ finalGrade: input.grade, finalText: text, edited, reviewedBy: reviewerId, status: "published", publishedAt: new Date() })
    .where(eq(corrections.id, correctionId));

  // Base d'expertise : chaque correction publiée devient un exemple pour les prochaines.
  const lines = ex.fen ? answerLines(ex.fen, a.answerPgn, a.answerText) : [];
  await db.insert(expertise).values({
    kind: "example",
    scope: "exercise",
    exerciseNumber: ex.number,
    studentAnswer: describeAnswer(a.answerText, lines),
    autoCheck: c.autoCheck,
    aiDraft: c.aiText,
    grade: input.grade,
    text,
    edited,
    source: "review",
    correctionId,
  });
  if (input.guideline?.text.trim()) {
    await db.insert(expertise).values({
      kind: "guideline",
      scope: input.guideline.scope,
      exerciseNumber: input.guideline.scope === "exercise" ? ex.number : null,
      theme: input.guideline.scope === "theme" ? (input.guideline.theme ?? ex.themes[0] ?? null) : null,
      text: input.guideline.text.trim(),
      source: "review",
      correctionId,
    });
  }

  await sendMail({
    to: u.email,
    subject: `Votre correction est disponible — exercice ${String(ex.number).padStart(4, "0")}`,
    text: [
      `Bonjour ${u.name},`,
      ``,
      `Le GMI Darko Anic a corrigé votre réponse à l'exercice ${String(ex.number).padStart(4, "0")}.`,
      `Retrouvez la correction et la solution dans votre espace élève :`,
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/espace/exercices/${ex.number}`,
      ``,
      `Institut Le Cavalier Bleu`,
    ].join("\n"),
  });
  return { exerciseNumber: ex.number, studentId: u.id };
}
