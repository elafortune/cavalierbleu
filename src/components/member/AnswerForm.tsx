"use client";

import { useActionState } from "react";
import { submitAnswerAction, type SubmitState } from "@/app/espace/actions";
import { AnswerBoard } from "@/components/chess/AnswerBoard";

export function AnswerForm({ exercise, startFen }: { exercise: number; startFen: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitAnswerAction, null);
  // Après un envoi réussi, on repart d'un échiquier vierge (le texte est vidé par le formulaire).
  const boardKey = state?.attemptId ?? "initial";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="exercise" value={exercise} />
      <AnswerBoard key={boardKey} startFen={startFen} />
      <label className="block">
        <span className="text-sm font-semibold text-navy-900">Votre explication</span>
        <span className="block text-xs text-muted">
          Expliquez votre idée et les variantes importantes (vous pouvez aussi écrire vos coups ici, en notation française).
        </span>
        <textarea
          name="answerText"
          rows={5}
          maxLength={8000}
          className="mt-2 block w-full rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
          placeholder="Ex. : 1...Rb8 ! Le Roi noir garde l'opposition : sur 2.Rc5, Rc7 ; sur 2.Rb5, Rb7 et c'est nul."
        />
      </label>
      {state && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy-900 px-8 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 max-sm:w-full"
      >
        {pending ? "Envoi…" : "Envoyer ma réponse"}
      </button>
    </form>
  );
}
