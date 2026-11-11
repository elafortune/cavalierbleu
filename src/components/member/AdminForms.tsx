"use client";

import { useActionState } from "react";
import { addGuidelineAction, grantAction, uploadAction, type ActionState } from "@/app/admin/actions";

const field = "rounded-xl border border-navy-900/15 bg-white px-3 py-2.5 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200";
const btn = "inline-flex min-h-11 items-center justify-center rounded-full bg-navy-900 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50";

const Status = ({ state }: { state: ActionState }) =>
  state ? (
    <p role="status" className={`mt-3 rounded-xl px-4 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>
      {state.message}
    </p>
  ) : null;

export function GrantForm({ modules }: { modules: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(grantAction, null);
  return (
    <form action={action}>
      <div className="flex flex-wrap gap-3">
        <input name="email" type="email" required placeholder="E-mail de l'élève" className={`${field} min-w-64 flex-1`} />
        <select name="module" required className={field}>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button className={btn} disabled={pending}>
          Ouvrir l&apos;accès
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

export function UploadForm({ modules }: { modules: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(uploadAction, null);
  return (
    <form action={action}>
      <div className="flex flex-wrap items-center gap-3">
        <input name="files" type="file" multiple accept=".pgn,.pdf,.docx,.md,.txt" required className="text-sm" />
        <select name="module" className={field} defaultValue="">
          <option value="">Module (pour les PDF)</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button className={btn} disabled={pending}>
          {pending ? "Import…" : "Importer"}
        </button>
      </div>
      <Status state={state} />
      {state?.reports?.map((r, i) => (
        <div key={i} className="mt-3 rounded-xl border border-navy-900/10 bg-white p-3 text-sm">
          <p className="font-semibold text-navy-900">
            [{r.kind}] {r.source} — {r.created} créés, {r.updated} mis à jour, {r.unchanged} inchangés
          </p>
          {r.items.slice(0, 30).map((it) => (
            <p key={it} className="text-muted">
              {it}
            </p>
          ))}
          {r.warnings.map((w) => (
            <p key={w} className="text-amber-700">
              ⚠ {w}
            </p>
          ))}
          {r.errors.map((e) => (
            <p key={e} className="text-red-700">
              ✗ {e}
            </p>
          ))}
        </div>
      ))}
    </form>
  );
}

export function GuidelineForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addGuidelineAction, null);
  return (
    <form action={action} className="space-y-3">
      <textarea name="text" rows={3} required placeholder="Ex. : Toujours féliciter l'élève quand il trouve le coup clé, même si l'analyse est incomplète." className={`${field} w-full`} />
      <div className="flex flex-wrap gap-3">
        <select name="scope" className={field} defaultValue="global">
          <option value="global">Toutes les corrections</option>
          <option value="theme">Un thème</option>
          <option value="exercise">Un exercice</option>
        </select>
        <input name="target" placeholder="Thème (ex. opposition) ou n° d'exercice" className={`${field} min-w-64 flex-1`} />
        <button className={btn} disabled={pending}>
          Ajouter
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}
