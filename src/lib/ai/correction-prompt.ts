// Construction du prompt de correction (indépendant du fournisseur d'IA).
// Le modèle ne décide pas si un coup est juste : il reçoit le verdict de la vérification automatique
// et rédige la correction dans le style de Darko, en s'appuyant sur ses corrections types et ses exemples.
import type { AutoCheck, Grade } from "@/lib/chess/check";
import { GRADE_LEGEND } from "@/lib/chess/check";
import { sanToFrench } from "@/lib/chess/french";

export type PromptExample = { studentAnswer: string; grade: string | null; text: string };

export type CorrectionPromptInput = {
  exercise: { number: number; prompt: string | null; fen: string; referencePgn: string; themes: string[] };
  templates: { label: string; body: string }[];
  guidelines: string[];
  examples: PromptExample[];
  answer: { text: string | null; lines: string[][] };
  autoCheck: AutoCheck;
};

const fr = (line: string[]) => line.map(sanToFrench).join(" ");

export const CORRECTION_SYSTEM = `Tu es l'assistant du Grand-Maître International Darko Anic, entraîneur de l'Institut Le Cavalier Bleu.
Tu rédiges en français la correction d'un exercice d'échecs envoyé par un élève de l'école à distance.

Règles impératives :
- Le verdict sur les coups vient de la VÉRIFICATION AUTOMATIQUE fournie (comparaison avec la solution de référence). Ne la contredis jamais et n'invente aucune variante : cite uniquement des coups présents dans la solution de référence ou dans la réponse de l'élève.
- Utilise la notation française (R, D, T, F, C ; pions sans lettre), comme Darko.
- Appuie-toi en priorité sur les corrections types de Darko pour cet exercice : choisis la plus adaptée à la réponse de l'élève et adapte-la (ne la recopie pas mot pour mot si l'élève a déjà compris une partie).
- Respecte les consignes de Darko et imite le ton de ses exemples : bienveillant, précis, pédagogique, concis.
- Termine par un conseil concret et personnalisé pour progresser (notion à revoir, réflexe à acquérir).

Légende des notes :
${(Object.entries(GRADE_LEGEND) as [Grade, string][]).map(([g, l]) => `${g} : ${l}`).join("\n")}

Réponds UNIQUEMENT en JSON : {"grade": "+|-|!?|?!|?", "feedback": "correction rédigée", "advice": "conseil personnalisé", "templateUsed": "A|B|…|null"}`;

export function buildCorrectionPrompt(i: CorrectionPromptInput): string {
  const c = i.autoCheck;
  const parts: string[] = [];
  parts.push(`## Exercice ${String(i.exercise.number).padStart(4, "0")}`);
  if (i.exercise.prompt) parts.push(`Consigne : ${i.exercise.prompt}`);
  parts.push(`Position (FEN) : ${i.exercise.fen}`);
  if (i.exercise.themes.length) parts.push(`Thèmes : ${i.exercise.themes.join(", ")}`);
  parts.push(`Solution de référence (PGN de Darko, notation anglaise) :\n${i.exercise.referencePgn.trim()}`);

  if (i.templates.length) {
    parts.push(`## Corrections types de Darko pour cet exercice`);
    for (const t of i.templates) parts.push(`${t.label}) ${t.body}`);
  }
  if (i.guidelines.length) {
    parts.push(`## Consignes de Darko`);
    for (const g of i.guidelines) parts.push(`- ${g}`);
  }
  if (i.examples.length) {
    parts.push(`## Exemples de corrections validées par Darko`);
    i.examples.forEach((e, k) => {
      parts.push(`Exemple ${k + 1} — réponse de l'élève :\n${e.studentAnswer}\nNote : ${e.grade ?? "?"}\nCorrection de Darko :\n${e.text}`);
    });
  }

  parts.push(`## Réponse de l'élève`);
  parts.push(i.answer.text?.trim() ? `Texte : ${i.answer.text.trim()}` : "Texte : (aucun)");
  parts.push(
    i.answer.lines.length ? `Coups joués / lus :\n${i.answer.lines.map((l) => `- ${fr(l)}`).join("\n")}` : "Coups joués : (aucun coup lisible)",
  );

  parts.push(`## Vérification automatique (fait foi)`);
  parts.push(c.summary);
  parts.push(`Coup clé : ${c.keyMove ? sanToFrench(c.keyMove) : "?"} — ${c.keyMoveFound ? "trouvé" : "NON trouvé"}`);
  for (const l of c.lines) {
    const bad = l.steps.find((s) => s.side === "solver" && s.verdict === "mistake");
    const unknown = l.steps.find((s) => s.verdict === "unknown");
    let note = "conforme à la référence";
    if (bad) note = `erreur ${sanToFrench(bad.san)} (réfutation : ${l.refutation ? fr(l.refutation) : "?"})`;
    else if (unknown) note = `sort de la référence à ${sanToFrench(unknown.san)} (non évalué : reste prudent)`;
    parts.push(`- ${fr(l.moves)} → ${note}`);
  }
  parts.push(`Note suggérée par la vérification : ${c.suggestedGrade}`);
  return parts.join("\n\n");
}

export type AiCorrection = { grade: Grade; feedback: string; advice: string; templateUsed: string | null };

export function parseAiCorrection(text: string): AiCorrection {
  const json = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Partial<AiCorrection>;
  const grades: Grade[] = ["+", "-", "!?", "?!", "?"];
  if (!json.grade || !grades.includes(json.grade as Grade)) throw new Error(`Note invalide : ${json.grade}`);
  if (!json.feedback?.trim()) throw new Error("Correction vide");
  return {
    grade: json.grade as Grade,
    feedback: json.feedback.trim(),
    advice: (json.advice ?? "").trim(),
    templateUsed: json.templateUsed ?? null,
  };
}
