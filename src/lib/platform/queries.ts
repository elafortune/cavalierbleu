// Lectures pour les pages élève et administration.
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { attempts, correctionTemplates, corrections, courseDocuments, dossiers, entitlements, exercises, expertise, importRuns, legacyAnswers, modules, user } from "@/db/schema";

export type ExerciseState = "indisponible" | "a-faire" | "envoye" | "corrige";

/** Vue d'un module pour un élève : dossiers, exercices et état de ses réponses. */
export async function moduleOverview(moduleId: string, userId: string) {
  const [mod] = await db.select().from(modules).where(eq(modules.id, moduleId));
  if (!mod) return null;
  const ds = await db.select().from(dossiers).where(eq(dossiers.moduleId, moduleId)).orderBy(asc(dossiers.position));
  const exs = await db
    .select({ number: exercises.number, dossierId: exercises.dossierId, indexInDossier: exercises.indexInDossier, status: exercises.status, prompt: exercises.prompt })
    .from(exercises)
    .where(eq(exercises.moduleId, moduleId))
    .orderBy(asc(exercises.number));
  const mine = await db
    .select({ n: attempts.exerciseNumber, status: corrections.status, grade: corrections.finalGrade, at: attempts.createdAt })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(and(eq(attempts.userId, userId), inArray(attempts.exerciseNumber, exs.map((e) => e.number).concat(-1))))
    .orderBy(desc(attempts.createdAt));
  const latest = new Map<number, { status: string; grade: string | null }>();
  const lastPublished = new Map<number, string | null>();
  for (const m of mine) {
    if (!latest.has(m.n)) latest.set(m.n, { status: m.status, grade: m.grade });
    if (m.status === "published" && !lastPublished.has(m.n)) lastPublished.set(m.n, m.grade);
  }
  const courses = await db.select().from(courseDocuments).where(eq(courseDocuments.moduleId, moduleId)).orderBy(asc(courseDocuments.position), asc(courseDocuments.title));

  return {
    module: mod,
    courses,
    dossiers: ds.map((d) => {
      const list = exs
        .filter((e) => e.dossierId === d.id)
        .map((e) => {
          const l = latest.get(e.number);
          const state: ExerciseState =
            e.status === "placeholder" ? "indisponible" : !l ? "a-faire" : lastPublished.has(e.number) ? "corrige" : "envoye";
          return { ...e, state, grade: lastPublished.get(e.number) ?? null };
        });
      return {
        ...d,
        exercises: list,
        available: list.filter((e) => e.state !== "indisponible").length,
        done: list.filter((e) => e.state === "envoye" || e.state === "corrige").length,
      };
    }),
  };
}

export async function exerciseForStudent(number: number, userId: string) {
  const [ex] = await db.select().from(exercises).where(eq(exercises.number, number));
  if (!ex) return null;
  const [d] = await db.select().from(dossiers).where(eq(dossiers.id, ex.dossierId));
  const [mod] = await db.select().from(modules).where(eq(modules.id, ex.moduleId));
  const history = await db
    .select({
      id: attempts.id,
      createdAt: attempts.createdAt,
      answerPgn: attempts.answerPgn,
      answerText: attempts.answerText,
      status: corrections.status,
      finalGrade: corrections.finalGrade,
      finalText: corrections.finalText,
      publishedAt: corrections.publishedAt,
    })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(and(eq(attempts.userId, userId), eq(attempts.exerciseNumber, number)))
    .orderBy(desc(attempts.createdAt));
  const neighbours = await db
    .select({ number: exercises.number })
    .from(exercises)
    .where(and(eq(exercises.dossierId, ex.dossierId), ne(exercises.status, "placeholder")))
    .orderBy(asc(exercises.number));
  return { exercise: ex, dossier: d, module: mod, history, neighbours: neighbours.map((n) => n.number) };
}

export async function studentStats(userId: string) {
  const [s] = await db
    .select({
      attempts: sql<number>`count(*)::int`,
      exercises: sql<number>`count(distinct ${attempts.exerciseNumber})::int`,
      published: sql<number>`count(*) filter (where ${corrections.status} = 'published')::int`,
      success: sql<number>`count(*) filter (where ${corrections.finalGrade} = '+')::int`,
    })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(eq(attempts.userId, userId));
  const recent = await db
    .select({ number: attempts.exerciseNumber, grade: corrections.finalGrade, publishedAt: corrections.publishedAt })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(and(eq(attempts.userId, userId), eq(corrections.status, "published")))
    .orderBy(desc(corrections.publishedAt))
    .limit(5);
  return { ...s, recent };
}

export async function moduleProgress(moduleIds: string[], userId: string) {
  if (!moduleIds.length) return [];
  return db
    .select({
      moduleId: exercises.moduleId,
      total: sql<number>`count(*)::int`,
      available: sql<number>`count(*) filter (where ${exercises.status} <> 'placeholder')::int`,
      done: sql<number>`count(distinct ${attempts.exerciseNumber})::int`,
    })
    .from(exercises)
    .leftJoin(attempts, and(eq(attempts.exerciseNumber, exercises.number), eq(attempts.userId, userId)))
    .where(inArray(exercises.moduleId, moduleIds))
    .groupBy(exercises.moduleId);
}

export async function courseDocument(id: number) {
  const [doc] = await db.select().from(courseDocuments).where(eq(courseDocuments.id, id));
  return doc ?? null;
}

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export async function reviewQueue() {
  return db
    .select({
      id: corrections.id,
      status: corrections.status,
      suggestedGrade: corrections.suggestedGrade,
      aiGrade: corrections.aiGrade,
      aiError: corrections.aiError,
      createdAt: corrections.createdAt,
      exerciseNumber: attempts.exerciseNumber,
      studentName: user.name,
      studentEmail: user.email,
    })
    .from(corrections)
    .innerJoin(attempts, eq(attempts.id, corrections.attemptId))
    .innerJoin(user, eq(user.id, attempts.userId))
    .where(ne(corrections.status, "published"))
    .orderBy(asc(corrections.createdAt));
}

export async function correctionDetail(id: number) {
  const [row] = await db
    .select({ c: corrections, a: attempts, ex: exercises, u: { id: user.id, name: user.name, email: user.email } })
    .from(corrections)
    .innerJoin(attempts, eq(attempts.id, corrections.attemptId))
    .innerJoin(exercises, eq(exercises.number, attempts.exerciseNumber))
    .innerJoin(user, eq(user.id, attempts.userId))
    .where(eq(corrections.id, id));
  if (!row) return null;
  const templates = await db.select().from(correctionTemplates).where(eq(correctionTemplates.exerciseNumber, row.ex.number)).orderBy(asc(correctionTemplates.label));
  const previous = await db
    .select({ id: attempts.id, createdAt: attempts.createdAt, grade: corrections.finalGrade, text: corrections.finalText })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(and(eq(attempts.userId, row.u.id), eq(attempts.exerciseNumber, row.ex.number), ne(attempts.id, row.a.id)))
    .orderBy(desc(attempts.createdAt));
  return { ...row, templates, previous };
}

export async function studentsOverview() {
  const users = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.name));
  const stats = await db
    .select({
      userId: attempts.userId,
      attempts: sql<number>`count(*)::int`,
      exercises: sql<number>`count(distinct ${attempts.exerciseNumber})::int`,
      published: sql<number>`count(*) filter (where ${corrections.status} = 'published')::int`,
      success: sql<number>`count(*) filter (where ${corrections.finalGrade} = '+')::int`,
      pending: sql<number>`count(*) filter (where ${corrections.status} <> 'published')::int`,
      last: sql<string | null>`max(${attempts.createdAt})`,
    })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .groupBy(attempts.userId);
  const ents = await db.select().from(entitlements);
  return users.map((u) => ({
    ...u,
    stats: stats.find((s) => s.userId === u.id) ?? null,
    modules: ents.filter((e) => e.email === u.email.toLowerCase()).map((e) => e.moduleId),
  }));
}

/** Résultats d'un élève par thème (suivi pédagogique). */
export async function studentThemes(userId: string) {
  const rows = await db
    .select({ themes: exercises.themes, grade: corrections.finalGrade })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .innerJoin(exercises, eq(exercises.number, attempts.exerciseNumber))
    .where(and(eq(attempts.userId, userId), eq(corrections.status, "published")));
  const map = new Map<string, { total: number; success: number }>();
  for (const r of rows) {
    for (const t of r.themes.length ? r.themes : ["(sans thème)"]) {
      const v = map.get(t) ?? { total: 0, success: 0 };
      v.total++;
      if (r.grade === "+") v.success++;
      map.set(t, v);
    }
  }
  return [...map].map(([theme, v]) => ({ theme, ...v })).sort((a, b) => a.success / a.total - b.success / b.total);
}

export async function studentHistory(userId: string) {
  return db
    .select({
      correctionId: corrections.id,
      number: attempts.exerciseNumber,
      createdAt: attempts.createdAt,
      status: corrections.status,
      suggested: corrections.suggestedGrade,
      grade: corrections.finalGrade,
    })
    .from(attempts)
    .innerJoin(corrections, eq(corrections.attemptId, attempts.id))
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(200);
}

export async function contentOverview() {
  const perModule = await db
    .select({
      moduleId: exercises.moduleId,
      total: sql<number>`count(*)::int`,
      ready: sql<number>`count(*) filter (where ${exercises.status} = 'ready')::int`,
      sample: sql<number>`count(*) filter (where ${exercises.status} = 'sample')::int`,
    })
    .from(exercises)
    .groupBy(exercises.moduleId);
  const mods = await db.select().from(modules).orderBy(asc(modules.position));
  const courses = await db.select({ moduleId: courseDocuments.moduleId, n: sql<number>`count(*)::int`, samples: sql<number>`count(*) filter (where ${courseDocuments.isSample})::int` }).from(courseDocuments).groupBy(courseDocuments.moduleId);
  const templates = await db.select({ n: sql<number>`count(distinct ${correctionTemplates.exerciseNumber})::int` }).from(correctionTemplates);
  const legacy = await db.select({ n: sql<number>`count(*)::int` }).from(legacyAnswers);
  const runs = await db.select().from(importRuns).orderBy(desc(importRuns.startedAt)).limit(15);
  const withContent = await db
    .select({ number: exercises.number, moduleId: exercises.moduleId, status: exercises.status, source: exercises.source, prompt: exercises.prompt })
    .from(exercises)
    .where(ne(exercises.status, "placeholder"))
    .orderBy(asc(exercises.number))
    .limit(300);
  return {
    modules: mods.map((m) => ({
      ...m,
      ...(perModule.find((p) => p.moduleId === m.id) ?? { total: 0, ready: 0, sample: 0 }),
      courses: courses.find((c) => c.moduleId === m.id) ?? { n: 0, samples: 0 },
    })),
    templatesFor: templates[0]?.n ?? 0,
    legacyAnswers: legacy[0]?.n ?? 0,
    runs,
    withContent,
  };
}

export async function expertiseList() {
  return db.select().from(expertise).orderBy(desc(expertise.createdAt)).limit(200);
}

export async function legacyAnswersFor(number: number) {
  return db.select().from(legacyAnswers).where(eq(legacyAnswers.exerciseNumber, number)).orderBy(desc(legacyAnswers.answeredAt));
}
