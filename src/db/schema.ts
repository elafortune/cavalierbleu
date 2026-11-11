import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const now = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updated = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ------------------------------------------------------------------ */
/* Authentification (tables attendues par Better Auth)                 */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  /** "student" | "admin" */
  role: text().notNull().default("student"),
  /** Référence de l'élève dans l'ancienne base (migration). */
  legacyRef: text(),
  createdAt: now(),
  updatedAt: updated(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: now(),
    updatedAt: updated(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: now(),
    updatedAt: updated(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: now(),
  updatedAt: updated(),
});

/* ------------------------------------------------------------------ */
/* Contenus pédagogiques                                               */
/* ------------------------------------------------------------------ */

export const modules = pgTable("modules", {
  id: text().primaryKey(), // "vert"
  name: text().notNull(),
  position: integer().notNull(),
  letter: text().notNull(),
});

export const dossiers = pgTable(
  "dossiers",
  {
    id: serial().primaryKey(),
    moduleId: text()
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    code: text().notNull(), // "N1", "DTC", "EXE"
    label: text().notNull(),
    position: integer().notNull(),
    firstExercise: integer().notNull(),
    lastExercise: integer().notNull(),
  },
  (t) => [uniqueIndex("dossier_module_code_uq").on(t.moduleId, t.code)],
);

/**
 * Un exercice = une position + une solution de référence (PGN complet avec variantes).
 * status : "placeholder" (squelette sans contenu) | "sample" (contenu fictif de test) | "ready" (contenu réel importé)
 */
export const exercises = pgTable(
  "exercises",
  {
    number: integer().primaryKey(), // numéro global (0825 → 825)
    moduleId: text()
      .notNull()
      .references(() => modules.id),
    dossierId: integer()
      .notNull()
      .references(() => dossiers.id),
    indexInDossier: integer().notNull(),
    title: text(),
    /** Consigne affichée (ex. « Les Noirs jouent et font nulle »). */
    prompt: text(),
    fen: text(),
    sideToMove: text(), // "w" | "b"
    referencePgn: text(),
    themes: text().array().notNull().default(sql`'{}'::text[]`),
    status: text().notNull().default("placeholder"),
    source: text(), // nom du fichier importé
    contentHash: text(),
    updatedAt: updated(),
  },
  (t) => [index("exercise_dossier_idx").on(t.dossierId), index("exercise_module_idx").on(t.moduleId)],
);

/** Cours PDF d'un module (ou d'un dossier). Fichier stocké en privé (Vercel Blob / disque local en dev). */
export const courseDocuments = pgTable(
  "course_documents",
  {
    id: serial().primaryKey(),
    moduleId: text()
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    dossierId: integer().references(() => dossiers.id, { onDelete: "set null" }),
    title: text().notNull(),
    fileName: text().notNull(),
    storageKey: text().notNull(),
    sizeBytes: integer().notNull(),
    position: integer().notNull().default(0),
    isSample: boolean().notNull().default(false),
    updatedAt: updated(),
  },
  (t) => [uniqueIndex("course_module_file_uq").on(t.moduleId, t.fileName)],
);

/** Corrections types rédigées par Darko pour un exercice (A, B, C…). */
export const correctionTemplates = pgTable(
  "correction_templates",
  {
    id: serial().primaryKey(),
    exerciseNumber: integer()
      .notNull()
      .references(() => exercises.number, { onDelete: "cascade" }),
    label: text().notNull(),
    body: text().notNull(),
    source: text(),
    updatedAt: updated(),
  },
  (t) => [uniqueIndex("template_ex_label_uq").on(t.exerciseNumber, t.label)],
);

/* ------------------------------------------------------------------ */
/* Accès, réponses, corrections                                        */
/* ------------------------------------------------------------------ */

/**
 * Droit d'accès à un module, rattaché à l'e-mail (permet l'achat avant la création du compte).
 * source : "stripe" | "admin" | "legacy"
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: serial().primaryKey(),
    email: text().notNull(),
    moduleId: text()
      .notNull()
      .references(() => modules.id),
    source: text().notNull(),
    reference: text(), // id de session Stripe, auteur de l'attribution manuelle…
    createdAt: now(),
  },
  (t) => [uniqueIndex("entitlement_email_module_uq").on(t.email, t.moduleId)],
);

/** Une tentative de réponse d'un élève (plusieurs tentatives possibles par exercice). */
export const attempts = pgTable(
  "attempts",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseNumber: integer()
      .notNull()
      .references(() => exercises.number),
    /** Coups joués sur l'échiquier, au format PGN (variantes comprises). */
    answerPgn: text(),
    /** Explication libre de l'élève. */
    answerText: text(),
    createdAt: now(),
  },
  (t) => [index("attempt_user_ex_idx").on(t.userId, t.exerciseNumber)],
);

/**
 * Correction d'une tentative.
 * status : "checked" (vérification automatique faite) → "ai_draft" (brouillon IA prêt)
 *          → "published" (validée/modifiée par Darko et visible par l'élève)
 */
export const corrections = pgTable(
  "corrections",
  {
    id: serial().primaryKey(),
    attemptId: text()
      .notNull()
      .unique()
      .references(() => attempts.id, { onDelete: "cascade" }),
    status: text().notNull().default("checked"),
    autoCheck: jsonb(),
    suggestedGrade: text(),
    aiGrade: text(),
    aiText: text(),
    aiModel: text(),
    aiError: text(),
    finalGrade: text(),
    finalText: text(),
    /** true si Darko a modifié le brouillon (signal d'apprentissage). */
    edited: boolean(),
    reviewedBy: text().references(() => user.id),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: now(),
    updatedAt: updated(),
  },
  (t) => [index("correction_status_idx").on(t.status)],
);

/**
 * Base d'expertise de Darko : alimente l'IA (exemples few-shot) et constitue
 * le jeu de données d'un futur fine-tuning.
 * kind : "example" (réponse élève → correction de référence) | "guideline" (consigne générale)
 * scope : "exercise" | "theme" | "global"
 */
export const expertise = pgTable(
  "expertise",
  {
    id: serial().primaryKey(),
    kind: text().notNull(),
    scope: text().notNull(),
    exerciseNumber: integer().references(() => exercises.number, { onDelete: "cascade" }),
    theme: text(),
    studentAnswer: text(),
    autoCheck: jsonb(),
    aiDraft: text(),
    grade: text(),
    text: text().notNull(),
    edited: boolean(),
    source: text().notNull(), // "review" | "import" | "manual"
    correctionId: integer().references(() => corrections.id, { onDelete: "set null" }),
    active: boolean().notNull().default(true),
    createdAt: now(),
  },
  (t) => [index("expertise_ex_idx").on(t.exerciseNumber), index("expertise_theme_idx").on(t.theme)],
);

/** Réponses historiques de l'ancien site (corpus d'évaluation de l'IA). */
export const legacyAnswers = pgTable(
  "legacy_answers",
  {
    id: serial().primaryKey(),
    exerciseNumber: integer().notNull(),
    studentRef: text(),
    answeredAt: timestamp({ withTimezone: true }),
    text: text().notNull(),
    grade: text(),
    source: text(),
    contentHash: text().notNull().unique(),
  },
  (t) => [index("legacy_ex_idx").on(t.exerciseNumber)],
);

/** Journal des imports de contenus. */
export const importRuns = pgTable("import_runs", {
  id: serial().primaryKey(),
  kind: text().notNull(),
  startedAt: now(),
  report: jsonb().notNull(),
});
