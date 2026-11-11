// Notation française (R = Roi, D = Dame, T = Tour, F = Fou, C = Cavalier) et lecture tolérante
// des réponses rédigées en texte libre par les élèves (« 1...Rb8 2.Rc5 Rc7 », « RC5,RC7.B5 », « Kb8 »…).
import { startingPosition } from "chessops/pgn";
import { makeSan, parseSan } from "chessops/san";
import type { Position } from "chessops/chess";

const EN_TO_FR: Record<string, string> = { K: "R", Q: "D", R: "T", B: "F", N: "C" };
const FR_TO_EN: Record<string, string> = { R: "K", D: "Q", T: "R", F: "B", C: "N" };

/** « Kb8 » → « Rb8 », « exd8=Q+ » → « exd8=D+ ». */
export function sanToFrench(san: string) {
  return san.replace(/^[KQRBN]/, (p) => EN_TO_FR[p]).replace(/=([QRBN])/, (_, p) => "=" + EN_TO_FR[p]);
}

const stripAnnotations = (t: string) => t.replace(/(?:[!?]+|\+-|-\+|\+\/-|-\/\+|[+#=±∓])+$/g, "");

/**
 * Essaie d'interpréter un jeton comme un coup légal dans la position (notation française,
 * anglaise, majuscules erronées, « Pb5 » pour un pion, « ç » pour « c »…).
 */
export function parseLooseMove(pos: Position, raw: string): string | null {
  let t = raw
    .normalize("NFC")
    .replace(/[çĉį]/gi, "c")
    .replace(/[–—−]/g, "-")
    .replace(/^[.…]+/, "")
    .replace(/[,;:.)(\]\[]+$/g, "")
    .trim();
  t = stripAnnotations(t);
  if (!t || t.length < 2 || t.length > 8) return null;
  if (/^0-0-0$|^o-o-o$/i.test(t)) t = "O-O-O";
  else if (/^0-0$|^o-o$/i.test(t)) t = "O-O";

  const candidates = new Set<string>();
  const push = (s: string) => s && candidates.add(s);
  push(t);
  // Pièce + cases en minuscules : « RC5 » → « Rc5 », « RB7 » → « Rb7 ».
  const norm = t.replace(/^([A-Za-z])(.*)$/, (_, a: string, rest: string) => a.toUpperCase() + rest.toLowerCase());
  push(norm);
  // Notation française → anglaise.
  const fr = norm.replace(/^([RDTFC])/, (p) => FR_TO_EN[p]).replace(/=([RDTFC])$/i, (_, p: string) => "=" + FR_TO_EN[p.toUpperCase()]);
  push(fr);
  // « Pb5 » / « pb5 » = pion.
  if (/^[Pp][a-h]/.test(t)) push(t.slice(1).toLowerCase());
  // Coup de pion écrit en majuscule : « B5 » → « b5 ».
  if (/^[A-H][1-8]$/.test(t)) push(t.toLowerCase());
  // Avec tiret : « Rc5-c7 » → « Kc7 » géré par chessops ? on retire le tiret de prise.
  for (const c of [...candidates]) if (c.includes("-") && !c.startsWith("O")) push(c.replace("-", ""));

  for (const c of candidates) {
    const m = parseSan(pos, c);
    if (m) return makeSan(pos, m);
  }
  return null;
}

type Token = { kind: "num"; ply: number } | { kind: "move"; text: string };

function tokenize(text: string, startFullmove: number, startTurn: "w" | "b"): Token[] {
  // Index du demi-coup (depuis la position de départ) correspondant à « N. » (Blancs) ou « N... » (Noirs).
  const startIndex = (startFullmove - 1) * 2 + (startTurn === "b" ? 1 : 0);
  const plyOf = (n: number, black: boolean) => (n - 1) * 2 + (black ? 1 : 0) - startIndex;
  const out: Token[] = [];
  const cleaned = text
    .replace(/\\'/g, "'")
    .replace(/\[[^\]]*\]/g, " ") // [fin-1], [2], dates…
    .replace(/\{[^}]*\}/g, " ")
    .replace(/(^|[\s(])[A-Ea-e]\)\s*/g, "$1 ") // repères « A) », « b) »
    .replace(/[()]/g, " ");
  let lastNum: { n: number; idx: number } | null = null;
  for (const raw of cleaned.split(/[\s,;]+/)) {
    if (!raw) continue;
    // Points de suspension isolés après un numéro : « 1. ...Rb8 », « 1 : …Rb8 ».
    const dotsOnly = /^[.…:]+$/.test(raw);
    if (dotsOnly) {
      if (lastNum && /\.{2,}|…/.test(raw)) out[lastNum.idx] = { kind: "num", ply: plyOf(lastNum.n, true) };
      continue;
    }
    const num = /^(\d{1,3})([.):-]*)(.*)$/.exec(raw);
    let rest = raw;
    if (num && !/^\d{1,3}[a-h]/i.test(raw)) {
      const n = Number(num[1]);
      let tail = num[3];
      const black = /\.{2,}|…/.test(num[2] + tail.slice(0, 3));
      tail = tail.replace(/^[.…\s-]+/, "");
      out.push({ kind: "num", ply: plyOf(n, black) });
      lastNum = { n, idx: out.length - 1 };
      rest = tail;
      if (!rest) continue;
    } else if (/^[.…]+/.test(raw) && lastNum && out.length - 1 === lastNum.idx) {
      out[lastNum.idx] = { kind: "num", ply: plyOf(lastNum.n, true) };
      rest = raw.replace(/^[.…]+/, "");
    }
    // « RC7.B5 », « Rc5-Rc7 » : plusieurs coups collés.
    const parts = /^(O-O(-O)?|0-0(-0)?)$/i.test(rest) ? [rest] : rest.split(/[.-](?=[A-Za-z])/);
    for (const p of parts) if (p) out.push({ kind: "move", text: p });
  }
  return out;
}

/**
 * Extrait des lignes de coups (SAN anglais) d'une réponse en texte libre.
 * Heuristique : on suit la ligne courante ; un numéro de coup ramène au demi-coup indiqué
 * (nouvelle variante) ; un coup illisible à la position courante mais jouable depuis le départ
 * démarre une nouvelle ligne. Les mots qui ne sont pas des coups sont ignorés.
 */
export function extractLinesFromText(startFen: string, text: string): string[][] {
  const start = startingPosition(new Map([["FEN", startFen]]));
  if (start.isErr) return [];
  const startPos = start.value;
  const tokens = tokenize(text, startPos.fullmoves, startPos.turn === "white" ? "w" : "b");
  const lines: string[][] = [];
  let line: string[] = [];
  let positions: Position[] = [startPos.clone()];

  const flush = () => {
    if (line.length) lines.push(line);
  };
  const replay = (sans: string[]) => {
    const ps: Position[] = [startPos.clone()];
    for (const s of sans) {
      const p = ps[ps.length - 1].clone();
      const m = parseSan(p, s);
      if (!m) break;
      p.play(m);
      ps.push(p);
    }
    return ps;
  };
  const resetTo = (ply: number) => {
    if (ply < 0) return false;
    if (ply === line.length) return true;
    // Une variante se rattache de préférence à la PREMIÈRE ligne donnée (la réponse principale de l'élève),
    // sinon à la ligne en cours.
    const first = lines[0] ?? line;
    const base = first.length >= ply ? first : line.length >= ply ? line : null;
    if (!base) return false;
    flush();
    line = base.slice(0, ply);
    positions = replay(line);
    return true;
  };

  for (const tok of tokens) {
    if (tok.kind === "num") {
      if (!resetTo(tok.ply) && tok.ply === 0) {
        flush();
        line = [];
        positions = [startPos.clone()];
      }
      continue;
    }
    const cur = positions[positions.length - 1];
    let san = parseLooseMove(cur, tok.text);
    if (!san) {
      // Nouvelle ligne depuis le départ ?
      const fromStart = parseLooseMove(startPos, tok.text);
      if (fromStart && line.length >= 2) {
        flush();
        line = [];
        positions = [startPos.clone()];
        san = fromStart;
      } else continue;
    }
    const p = positions[positions.length - 1].clone();
    const mv = parseSan(p, san);
    if (!mv) continue;
    p.play(mv);
    line = [...line, san];
    positions = [...positions, p];
  }
  flush();
  // Dédoublonnage (préfixes et lignes identiques).
  const keys = lines.map((l) => l.join(" "));
  return lines.filter((l, i) => {
    const k = keys[i];
    return keys.findIndex((x) => x === k) === i && !keys.some((x, j) => j !== i && x.startsWith(k + " "));
  });
}
