"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { getLlmProvider } from "@/lib/ai/provider";
import { hasModuleAccess } from "@/lib/platform/access";
import { generateAiDraft, submitAttempt, SubmitError } from "@/lib/platform/corrections";
import { getCurrentUser } from "@/lib/session";

export type SubmitState = { ok: boolean; message: string; attemptId?: string } | null;

export async function submitAnswerAction(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, message: "Votre session a expiré : reconnectez-vous." };
  const number = Number(form.get("exercise"));
  const [ex] = await db.select({ moduleId: exercises.moduleId }).from(exercises).where(eq(exercises.number, number));
  if (!ex || !(await hasModuleAccess(me.email, ex.moduleId, me.role === "admin"))) {
    return { ok: false, message: "Vous n'avez pas accès à cet exercice." };
  }
  try {
    const res = await submitAttempt(me.id, number, String(form.get("answerPgn") ?? ""), String(form.get("answerText") ?? ""));
    // Brouillon de correction par l'IA, après la réponse (n'allonge pas l'envoi).
    if (getLlmProvider()) after(() => generateAiDraft(res.correctionId));
    refresh();
    return { ok: true, attemptId: res.attemptId, message: "Réponse envoyée ! Elle sera corrigée par le GMI Darko Anic ; vous serez prévenu par e-mail." };
  } catch (e) {
    if (e instanceof SubmitError) return { ok: false, message: e.message };
    console.error("[submitAnswer]", e);
    return { ok: false, message: "L'envoi a échoué. Réessayez dans un instant." };
  }
}
