"use client";

import Link from "next/link";
import { useState } from "react";
import { MODULES } from "@/content/modules";
import { mailto } from "@/lib/site";

type Step = "start" | "elo" | "experience" | "result";

const ELO_RANGES: [string, string | null][] = [
  ["1100 – 1300", "orange"],
  ["1300 – 1500", "rouge"],
  ["1500 – 1700", "vert"],
  ["1700 – 1900", "azur"],
  ["1900 – 2100", "turquoise"],
  ["Plus de 2100", "indigo"],
  ["Moins de 1100 / autre", null],
];

const DURATION: [string, number][] = [
  ["Moins de 6 mois", 1],
  ["Moins d'un an", 2],
  ["Moins de 2 ans", 3],
  ["Moins de 5 ans", 4],
  ["5 ans ou plus", 4],
];

const HABITS: [string, number][] = [
  ["Je lis des livres et magazines d'échecs", 6],
  ["Je joue régulièrement en club", 5],
  ["Je joue sur Internet ou avec un logiciel", 4],
  ["Je participe à des compétitions locales", 5],
];

const btn =
  "w-full rounded-2xl border border-navy-900/15 bg-white px-5 py-4 text-left font-medium text-navy-900 transition hover:border-brand-700 hover:bg-brand-100/50";

export function ModuleGuide() {
  const [step, setStep] = useState<Step>("start");
  const [result, setResult] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [habits, setHabits] = useState<number[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const finish = (moduleId: string | null, n?: string) => {
    setResult(moduleId);
    setNote(n ?? null);
    setStep("result");
  };

  const reset = () => {
    setStep("start");
    setResult(null);
    setDuration(null);
    setHabits([]);
    setNote(null);
  };

  const scoreExperience = () => {
    const total = (duration ?? 0) + habits.reduce((sum, i) => sum + HABITS[i][1], 0);
    if (total <= 5) finish("jaune", `Votre score : ${total} points.`);
    else if (total <= 15) finish("orange", `Votre score : ${total} points.`);
    else if (total <= 25) finish("rouge", `Votre score : ${total} points.`);
    else finish("rouge", `Votre score : ${total} points — n'hésitez pas à demander un test d'orientation pour viser plus haut.`);
  };

  const mod = MODULES.find((m) => m.id === result);
  const progress = { start: 1, elo: 2, experience: 2, result: 3 }[step];

  return (
    <div className="rounded-3xl border border-navy-900/10 bg-cream p-6 shadow-xl shadow-navy-900/5 sm:p-10">
      <div className="mb-8 flex items-center gap-2" aria-label={`Étape ${progress} sur 3`}>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= progress ? "bg-brand-700" : "bg-navy-900/10"}`} />
        ))}
      </div>

      {step === "start" && (
        <div>
          <h2 className="font-serif text-2xl text-navy-900 sm:text-3xl">Où en êtes-vous aux échecs ?</h2>
          <div className="mt-6 grid gap-3">
            <button className={btn} onClick={() => finish("jaune", "Le Module Jaune part des règles du jeu.")}>
              Je suis débutant
            </button>
            <button className={btn} onClick={() => setStep("elo")}>
              J&apos;ai un classement FFE ou Elo FIDE
            </button>
            <button className={btn} onClick={() => setStep("experience")}>
              Je sais jouer, mais je n&apos;ai pas de classement
            </button>
          </div>
        </div>
      )}

      {step === "elo" && (
        <div>
          <h2 className="font-serif text-2xl text-navy-900 sm:text-3xl">Votre classement Elo se situe…</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ELO_RANGES.map(([label, id]) => (
              <button
                key={label}
                className={btn}
                onClick={() => finish(id, id ? undefined : "Pour ce niveau, contactez-nous : nous vous orienterons personnellement.")}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={reset} className="mt-6 text-sm text-muted hover:text-navy-900">
            ← Retour
          </button>
        </div>
      )}

      {step === "experience" && (
        <div>
          <h2 className="font-serif text-2xl text-navy-900 sm:text-3xl">Depuis combien de temps jouez-vous ?</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DURATION.map(([label, pts]) => (
              <button
                key={label}
                onClick={() => setDuration(pts)}
                aria-pressed={duration === pts}
                className={`${btn} ${duration === pts ? "border-brand-700 bg-brand-100/60" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          <h3 className="mt-8 font-serif text-xl text-navy-900">Cochez ce qui vous correspond</h3>
          <div className="mt-4 grid gap-3">
            {HABITS.map(([label, pts], i) => {
              const on = habits.includes(i);
              return (
                <label key={label} className={`${btn} flex cursor-pointer items-center gap-3 ${on ? "border-brand-700 bg-brand-100/60" : ""}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setHabits((h) => (on ? h.filter((x) => x !== i) : [...h, i]))}
                    className="h-4 w-4 accent-[#1a6db1]"
                  />
                  {label}
                  <span className="sr-only">({pts} points)</span>
                </label>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <button onClick={reset} className="text-sm text-muted hover:text-navy-900">
              ← Retour
            </button>
            <button
              disabled={duration === null}
              onClick={scoreExperience}
              className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              Voir mon module →
            </button>
          </div>
        </div>
      )}

      {step === "result" && (
        <div aria-live="polite">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Notre recommandation</p>
          {mod ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: mod.color }} aria-hidden />
                <h2 className="font-serif text-3xl text-navy-900 sm:text-4xl">{mod.name}</h2>
              </div>
              <p className="mt-2 font-semibold text-muted">
                Cycle {mod.cycle} · {mod.level} · {mod.dossiers}
              </p>
              <p className="mt-4 leading-relaxed text-ink">{mod.description[0]}</p>
            </>
          ) : (
            <h2 className="mt-4 font-serif text-3xl text-navy-900">Parlons-en ensemble</h2>
          )}
          {note && <p className="mt-4 rounded-xl bg-brand-100/60 p-4 text-sm text-navy-900">{note}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {mod && (
              <Link href={`/cours-a-distance#${mod.id}`} className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                Découvrir le {mod.name}
              </Link>
            )}
            <a href={mailto("Test d'orientation")} className="rounded-full border border-navy-900/20 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:border-navy-900">
              Demander un test d&apos;orientation
            </a>
            <button onClick={reset} className="px-2 text-sm text-muted hover:text-navy-900">
              Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
