// Vérification automatique d'une réponse d'élève par comparaison avec l'arbre de référence (PGN de Darko).
// Aucune IA ici : le verdict « juste / réfuté / hors référence » est déterministe.
// La note proposée (+, -, !?, ?!, ?) est une SUGGESTION, affinée ensuite par l'IA et validée par Darko.
import { sanToFrench as fr } from "./french";
import { isBadNag, isGoodNag, mainLine, type GameTree, type MoveNode } from "./pgn";

export type Grade = "+" | "-" | "!?" | "?!" | "?";

export const GRADE_LEGEND: Record<Grade, string> = {
  "+": "la réponse correcte",
  "-": "la réponse incorrecte ou l'absence de réponse",
  "!?": "l'idée est bonne mais l'exécution n'est pas précise",
  "?!": "la réponse est douteuse, elle ne suit pas l'idée",
  "?": "la réponse n'est pas complète",
};

export type StepVerdict =
  | "best" // coup de la suite principale
  | "good" // variante acceptable (non marquée comme erreur)
  | "mistake" // variante marquée ?, ?? ou ?! par l'auteur
  | "defense" // coup de l'adversaire prévu par la référence
  | "unknown"; // hors de l'arbre de référence (à évaluer par moteur / IA / Darko)

export type LineReport = {
  moves: string[];
  steps: { san: string; ply: number; side: "solver" | "opponent"; verdict: StepVerdict }[];
  /** Nombre de demi-coups suivis dans la référence avant d'en sortir. */
  matchedPlies: number;
  /** Suite de référence qui réfute le premier coup erroné du solutionneur (s'il y en a un). */
  refutation?: string[];
};

export type AutoCheck = {
  version: 1;
  hasMoves: boolean;
  solver: "w" | "b";
  keyMove: string | null; // premier coup de la solution
  keyMoveFound: boolean;
  firstMoves: { san: string; verdict: StepVerdict }[];
  mainLineLength: number;
  mainLineCoverage: number; // 0..1 : profondeur atteinte dans la suite principale
  /** Défenses adverses prévues après le coup clé, et celles que l'élève a traitées. */
  defenses: { expected: string[]; covered: string[] };
  /** Erreurs signalées par la référence que l'élève a su réfuter (analyse des alternatives = positif). */
  refutedAlternativesShown: string[];
  lines: LineReport[];
  suggestedGrade: Grade;
  summary: string;
};

const bare = (san: string) => san.replace(/[+#!?]+$/g, "");

function walkLine(ref: GameTree, moves: string[]): LineReport {
  const steps: LineReport["steps"] = [];
  let ids = ref.rootChildren;
  let matched = 0;
  let refutation: string[] | undefined;
  let inTree = true;
  moves.forEach((san, i) => {
    const side = (i % 2 === 0) === true ? "solver" : "opponent";
    if (!inTree) {
      steps.push({ san, ply: i + 1, side, verdict: "unknown" });
      return;
    }
    const idx = ids.findIndex((id) => bare(ref.nodes[id].san) === bare(san));
    if (idx < 0) {
      inTree = false;
      steps.push({ san, ply: i + 1, side, verdict: "unknown" });
      return;
    }
    const node = ref.nodes[ids[idx]];
    let verdict: StepVerdict;
    if (side === "opponent") verdict = "defense";
    else if (isBadNag(node.nags)) verdict = "mistake";
    else if (idx === 0) verdict = "best";
    else verdict = isGoodNag(node.nags) ? "good" : "good";
    if (verdict === "mistake" && !refutation) refutation = mainLine(ref, node.children).slice(0, 8).map((n) => n.san);
    steps.push({ san, ply: i + 1, side, verdict });
    matched++;
    ids = node.children;
  });
  return { moves, steps, matchedPlies: matched, refutation };
}

/**
 * @param ref    arbre de référence de l'exercice
 * @param lines  lignes de l'élève (coups SAN depuis la position de départ), issues de l'échiquier ou du texte
 */
export function checkAnswer(ref: GameTree, lines: string[][]): AutoCheck {
  const main = mainLine(ref);
  const keyNode: MoveNode | undefined = main[0];
  const keyMove = keyNode?.san ?? null;
  const reports = lines.filter((l) => l.length).map((l) => walkLine(ref, l));
  const hasMoves = reports.length > 0;

  const firstMovesMap = new Map<string, StepVerdict>();
  for (const r of reports) firstMovesMap.set(r.steps[0].san, r.steps[0].verdict);
  const firstMoves = [...firstMovesMap].map(([san, verdict]) => ({ san, verdict }));
  const keyMoveFound = Boolean(keyMove && reports.some((r) => bare(r.moves[0]) === bare(keyMove)));

  // Profondeur atteinte dans la suite principale.
  let coverage = 0;
  for (const r of reports) {
    let k = 0;
    while (k < r.moves.length && k < main.length && bare(r.moves[k]) === bare(main[k].san)) k++;
    coverage = Math.max(coverage, main.length ? k / main.length : 0);
  }

  // Défenses adverses après le coup clé (réponses prévues au 2e demi-coup).
  const expected = keyNode ? keyNode.children.map((id) => ref.nodes[id].san) : [];
  const covered = expected.filter((d) =>
    reports.some((r) => keyMove && bare(r.moves[0]) === bare(keyMove) && r.moves[1] && bare(r.moves[1]) === bare(d)),
  );

  // Alternatives erronées montrées AVEC leur réfutation (ex. « 1...Rc7? 2.Rc5! »).
  const refutedAlternativesShown = reports
    .filter((r) => keyMoveFound && r.steps[0].verdict === "mistake" && r.refutation && r.moves[1] && bare(r.moves[1]) === bare(r.refutation[0]))
    .map((r) => r.moves[0]);

  const solverMistakeAfterKey = reports.some(
    (r) =>
      keyMove &&
      bare(r.moves[0]) === bare(keyMove) &&
      r.steps.slice(1).some((s) => s.side === "solver" && s.verdict === "mistake"),
  );
  const wrongFirstOnly = reports.filter((r) => r.steps[0].verdict === "mistake" && !refutedAlternativesShown.includes(r.moves[0]));
  const unknownFirst = reports.filter((r) => r.steps[0].verdict === "unknown");

  let grade: Grade;
  if (!hasMoves) grade = "-";
  else if (!keyMoveFound) grade = wrongFirstOnly.length ? "-" : unknownFirst.length ? "?!" : "-";
  else if (solverMistakeAfterKey) grade = "!?";
  else if (coverage >= 0.6 || (expected.length > 1 && covered.length >= Math.ceil(expected.length / 2))) grade = "+";
  else grade = "?";

  const parts: string[] = [];
  if (!hasMoves) parts.push("Aucun coup lisible dans la réponse.");
  else {
    parts.push(keyMoveFound ? `Coup clé ${fr(keyMove ?? "")} trouvé.` : `Coup clé ${keyMove ? fr(keyMove) : "?"} non trouvé.`);
    if (wrongFirstOnly.length) parts.push(`Premier coup erroné proposé : ${wrongFirstOnly.map((r) => fr(r.moves[0])).join(", ")}.`);
    if (unknownFirst.length) parts.push(`Premier coup hors référence : ${unknownFirst.map((r) => fr(r.moves[0])).join(", ")}.`);
    if (expected.length) parts.push(`Défenses traitées : ${covered.length}/${expected.length} (${expected.map(fr).join(", ")}).`);
    if (refutedAlternativesShown.length) parts.push(`Alternatives réfutées à bon escient : ${refutedAlternativesShown.map(fr).join(", ")}.`);
    parts.push(`Profondeur dans la suite principale : ${Math.round(coverage * 100)} %.`);
  }

  return {
    version: 1,
    hasMoves,
    solver: ref.sideToMove,
    keyMove,
    keyMoveFound,
    firstMoves,
    mainLineLength: main.length,
    mainLineCoverage: Math.round(coverage * 100) / 100,
    defenses: { expected, covered },
    refutedAlternativesShown,
    lines: reports,
    suggestedGrade: grade,
    summary: parts.join(" "),
  };
}
