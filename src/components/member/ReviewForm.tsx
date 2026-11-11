"use client";

import { useActionState, useRef, useState } from "react";
import { publishAction, type ActionState } from "@/app/admin/actions";
import { GRADE_LEGEND, type Grade } from "@/lib/chess/check";

const GRADES = Object.keys(GRADE_LEGEND) as Grade[];

export function ReviewForm({
  correctionId,
  initialGrade,
  initialText,
  templates,
  themes,
  nextId,
}: {
  correctionId: number;
  initialGrade: string | null;
  initialText: string;
  templates: { label: string; body: string }[];
  themes: string[];
  nextId: number | null;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(publishAction, null);
  const [text, setText] = useState(initialText);
  const [scope, setScope] = useState("exercise");
  const area = useRef<HTMLTextAreaElement>(null);
  const field = "mt-1.5 block w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="correctionId" value={correctionId} />
      {nextId && <input type="hidden" name="next" value={nextId} />}

      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">Note</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {GRADES.map((g) => (
            <label key={g} className="flex cursor-pointer items-start gap-2 rounded-xl border border-navy-900/10 bg-white p-3 text-xs has-[:checked]:border-brand-700 has-[:checked]:bg-brand-100">
              <input type="radio" name="grade" value={g} defaultChecked={initialGrade === g} required className="mt-0.5 accent-[#1a6db1]" />
              <span>
                <span className="block font-mono text-base font-bold text-navy-900">{g}</span>
                {GRADE_LEGEND[g]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {templates.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-navy-900">Corrections types de l&apos;exercice</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                type="button"
                title={t.body}
                onClick={() => {
                  setText(t.body);
                  area.current?.focus();
                }}
                className="rounded-full border border-navy-900/15 bg-white px-4 py-2 text-sm font-medium text-navy-900 hover:bg-brand-100"
              >
                Utiliser {t.label})
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-navy-900">Correction envoyée à l&apos;élève</span>
        <textarea ref={area} name="text" rows={10} value={text} onChange={(e) => setText(e.target.value)} required className={field} />
      </label>

      <details className="rounded-2xl border border-navy-900/10 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">Ajouter une consigne pour l&apos;IA (facultatif)</summary>
        <p className="mt-2 text-xs text-muted">
          Ex. : « Sur les finales Roi + pion, toujours rappeler les cases clés et compter les cases pour l&apos;opposition. » Elle sera
          utilisée pour toutes les prochaines corrections concernées.
        </p>
        <textarea name="guideline" rows={3} className={field} />
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <select name="guidelineScope" value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-xl border border-navy-900/15 bg-white px-3 py-2">
            <option value="exercise">Pour cet exercice</option>
            <option value="theme">Pour un thème</option>
            <option value="global">Pour toutes les corrections</option>
          </select>
          {scope === "theme" && (
            <select name="guidelineTheme" className="rounded-xl border border-navy-900/15 bg-white px-3 py-2">
              {themes.length ? themes.map((t) => <option key={t}>{t}</option>) : <option value="">(exercice sans thème)</option>}
            </select>
          )}
        </div>
      </details>

      {state && !state.ok && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</p>}
      <button disabled={pending} className="inline-flex min-h-12 items-center rounded-full bg-navy-900 px-8 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 max-sm:w-full max-sm:justify-center">
        {pending ? "Publication…" : nextId ? "Publier et passer à la suivante" : "Publier la correction"}
      </button>
    </form>
  );
}
