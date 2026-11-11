"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { expertise } from "@/db/schema";
import type { Grade } from "@/lib/chess/check";
import { importCorrections, importCoursePdf, importPgnText, logRun, type ImportReport } from "@/lib/content/import";
import { grantModules, revokeModule } from "@/lib/platform/access";
import { generateAiDraft, GRADES, publishCorrection } from "@/lib/platform/corrections";
import { requireAdmin } from "@/lib/session";

export type ActionState = { ok: boolean; message: string; reports?: ImportReport[] } | null;

export async function publishAction(_p: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = Number(form.get("correctionId"));
  const grade = String(form.get("grade")) as Grade;
  const text = String(form.get("text") ?? "").trim();
  if (!GRADES.includes(grade)) return { ok: false, message: "Choisissez une note." };
  if (!text) return { ok: false, message: "La correction est vide." };
  const guidelineText = String(form.get("guideline") ?? "").trim();
  const scope = String(form.get("guidelineScope") ?? "exercise") as "exercise" | "theme" | "global";
  await publishCorrection(admin.id, id, {
    grade,
    text,
    guideline: guidelineText ? { text: guidelineText, scope, theme: String(form.get("guidelineTheme") ?? "") || undefined } : undefined,
  });
  const next = String(form.get("next") ?? "");
  redirect(next ? `/admin/corrections/${next}` : "/admin/corrections?publie=1");
}

export async function draftAction(form: FormData) {
  await requireAdmin();
  await generateAiDraft(Number(form.get("correctionId")));
  refresh();
}

export async function grantAction(_p: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const moduleId = String(form.get("module") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email) || !moduleId) return { ok: false, message: "E-mail ou module invalide." };
  const n = await grantModules(email, [moduleId], "admin", admin.email);
  refresh();
  return { ok: true, message: n ? `Module ouvert pour ${email}.` : `${email} avait déjà accès à ce module.` };
}

export async function revokeAction(form: FormData) {
  await requireAdmin();
  await revokeModule(String(form.get("email")), String(form.get("module")));
  refresh();
}

export async function uploadAction(_p: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const moduleId = String(form.get("module") ?? "");
  if (!files.length) return { ok: false, message: "Aucun fichier sélectionné." };
  const reports: ImportReport[] = [];
  for (const f of files) {
    const name = f.name;
    const ext = name.toLowerCase().split(".").pop();
    const buf = Buffer.from(await f.arrayBuffer());
    if (ext === "pgn") reports.push(await importPgnText(db, buf.toString("utf8"), name));
    else if (ext === "pdf") {
      if (!moduleId) {
        reports.push({ kind: "cours", source: name, created: 0, updated: 0, unchanged: 0, warnings: [], errors: ["Choisissez le module du PDF."], items: [] });
        continue;
      }
      reports.push(await importCoursePdf(db, moduleId, name, buf));
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      reports.push(await importCorrections(db, (await mammoth.extractRawText({ buffer: buf })).value, name));
    } else if (ext === "md" || ext === "txt") reports.push(await importCorrections(db, buf.toString("utf8"), name));
    else reports.push({ kind: "?", source: name, created: 0, updated: 0, unchanged: 0, warnings: [], errors: ["Format non reconnu (PGN, PDF, DOCX, MD, TXT)."], items: [] });
  }
  for (const r of reports) await logRun(db, r);
  refresh();
  const errors = reports.reduce((a, r) => a + r.errors.length, 0);
  return { ok: errors === 0, message: errors ? `${errors} erreur(s) : voir le détail.` : "Import terminé.", reports };
}

export async function addGuidelineAction(_p: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const text = String(form.get("text") ?? "").trim();
  const scope = String(form.get("scope") ?? "global") as "global" | "theme" | "exercise";
  const target = String(form.get("target") ?? "").trim();
  if (!text) return { ok: false, message: "La consigne est vide." };
  if (scope !== "global" && !target) return { ok: false, message: "Indiquez le thème ou le numéro d'exercice." };
  await db.insert(expertise).values({
    kind: "guideline",
    scope,
    theme: scope === "theme" ? target.toLowerCase() : null,
    exerciseNumber: scope === "exercise" ? Number(target) : null,
    text,
    source: "manual",
  });
  refresh();
  return { ok: true, message: "Consigne ajoutée : elle sera transmise à l'IA pour les prochaines corrections." };
}

export async function toggleExpertiseAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const [row] = await db.select({ active: expertise.active }).from(expertise).where(eq(expertise.id, id));
  if (row) await db.update(expertise).set({ active: !row.active }).where(eq(expertise.id, id));
  refresh();
}
