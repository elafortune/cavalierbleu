// Lecture des PGN (format standard des échecs) en un arbre sérialisable :
// position de départ (FEN), coups, variantes, annotations NAG ($1, $18…), commentaires,
// cases et flèches colorées ([%csl Ga6], [%cal Ge2e4]). Utilisé côté serveur (import,
// vérification des réponses) et côté client (échiquier d'étude).
import { Chess } from "chessops/chess";
import { makeFen } from "chessops/fen";
import { makePgn, parseComment, parsePgn, startingPosition, type Node, type PgnNodeData } from "chessops/pgn";
import { makeSan, parseSan } from "chessops/san";
import { makeUci } from "chessops/util";
import type { Position } from "chessops/chess";

export type Shape = { color: "green" | "red" | "yellow" | "blue"; from: string; to: string };

export type MoveNode = {
  id: string;
  parentId: string | null;
  ply: number; // 1 = premier demi-coup joué depuis la position de départ
  san: string;
  uci: string;
  fen: string; // position APRÈS le coup
  /** Numéro de coup affiché (ex. 1 pour « 1... Rb8 »). */
  moveNumber: number;
  color: "w" | "b"; // camp qui a joué ce coup
  nags: number[];
  comment?: string;
  preComment?: string;
  shapes: Shape[];
  children: string[]; // children[0] = suite principale, les autres = variantes
};

export type GameTree = {
  headers: Record<string, string>;
  startFen: string;
  sideToMove: "w" | "b";
  rootComment?: string;
  rootShapes: Shape[];
  rootChildren: string[];
  nodes: Record<string, MoveNode>;
  errors: string[];
};

export const ROOT = "root";

/** Normalise un fichier PGN (BOM, fins de ligne Windows). */
export const cleanPgnText = (text: string) => text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");

/** Retire les marqueurs ChessBase sans intérêt à l'affichage (ex. « [#] » = diagramme). */
const tidyComment = (c: string) => c.replace(/\[#\]/g, "").replace(/\s+/g, " ").trim();

function readComments(raw: string[] | undefined) {
  const shapes: Shape[] = [];
  const texts: string[] = [];
  for (const c of raw ?? []) {
    const parsed = parseComment(c);
    for (const s of parsed.shapes) {
      shapes.push({ color: s.color, from: squareName(s.from), to: squareName(s.to) });
    }
    const t = tidyComment(parsed.text);
    if (t) texts.push(t);
  }
  return { text: texts.join(" ") || undefined, shapes };
}

const squareName = (sq: number) => "abcdefgh"[sq & 7] + String((sq >> 3) + 1);

function convertGame(game: { headers: Map<string, string>; comments?: string[]; moves: Node<PgnNodeData> }): GameTree {
  const headers = Object.fromEntries(game.headers);
  const errors: string[] = [];
  const start = startingPosition(game.headers);
  let pos: Position;
  if (start.isErr) {
    errors.push(`Position de départ invalide (${headers.FEN ?? "FEN absente"}) : ${start.error.message}`);
    pos = Chess.default();
  } else {
    pos = start.value;
  }
  const startFen = makeFen(pos.toSetup());
  const nodes: Record<string, MoveNode> = {};
  let counter = 0;
  const rootInfo = readComments(game.comments);
  const firstStarting = game.moves.children[0]?.data.startingComments;
  const rootExtra = readComments(firstStarting);

  const walk = (parent: Node<PgnNodeData>, parentPos: Position, parentId: string | null, ply: number): string[] => {
    const ids: string[] = [];
    for (const child of parent.children) {
      const p = parentPos.clone();
      const move = parseSan(p, child.data.san);
      if (!move) {
        errors.push(`Coup illégal ou illisible « ${child.data.san} » au demi-coup ${ply + 1}.`);
        continue;
      }
      const color = p.turn === "white" ? "w" : "b";
      const moveNumber = p.fullmoves;
      const san = makeSan(p, move);
      p.play(move);
      const id = `n${++counter}`;
      const after = readComments(child.data.comments);
      // Les commentaires « avant le coup » du tout premier coup sont déjà ceux de la racine.
      const before = parentId === null && child === game.moves.children[0] ? { text: undefined, shapes: [] } : readComments(child.data.startingComments);
      nodes[id] = {
        id,
        parentId,
        ply: ply + 1,
        san,
        uci: makeUci(move),
        fen: makeFen(p.toSetup()),
        moveNumber,
        color,
        nags: child.data.nags ?? [],
        comment: after.text,
        preComment: before.text,
        shapes: [...before.shapes, ...after.shapes],
        children: [],
      };
      nodes[id].children = walk(child, p, id, ply + 1);
      ids.push(id);
    }
    return ids;
  };

  const rootChildren = walk(game.moves, pos, null, 0);
  return {
    headers,
    startFen,
    sideToMove: pos.turn === "white" ? "w" : "b",
    rootComment: [rootInfo.text, rootExtra.text].filter(Boolean).join(" ") || undefined,
    rootShapes: [...rootInfo.shapes, ...rootExtra.shapes],
    rootChildren,
    nodes,
    errors,
  };
}

/** Lit un fichier PGN pouvant contenir plusieurs parties / exercices. */
export function parsePgnFile(text: string): GameTree[] {
  return parsePgn(cleanPgnText(text)).map(convertGame);
}

export function parseSinglePgn(text: string): GameTree {
  const games = parsePgnFile(text);
  if (!games.length) throw new Error("PGN vide");
  return games[0];
}

/** Toutes les lignes (racine → feuille) de l'arbre, sous forme de listes d'identifiants. */
export function allLines(tree: GameTree): string[][] {
  const out: string[][] = [];
  const rec = (ids: string[], path: string[]) => {
    for (const id of ids) {
      const next = [...path, id];
      const kids = tree.nodes[id].children;
      if (kids.length) rec(kids, next);
      else out.push(next);
    }
  };
  rec(tree.rootChildren, []);
  return out;
}

/** Suite principale à partir d'un nœud (ou de la racine). */
export function mainLine(tree: GameTree, fromChildren = tree.rootChildren): MoveNode[] {
  const out: MoveNode[] = [];
  let ids = fromChildren;
  while (ids.length) {
    const n = tree.nodes[ids[0]];
    out.push(n);
    ids = n.children;
  }
  return out;
}

/** Construit un PGN à partir d'une position de départ et de lignes de coups SAN (première = principale). */
export function linesToPgn(startFen: string, lines: string[][], headers: Record<string, string> = {}): string {
  type T = { san: string; kids: T[] };
  const root: T = { san: "", kids: [] };
  for (const line of lines) {
    let cur = root;
    for (const san of line) {
      let next = cur.kids.find((k) => k.san === san);
      if (!next) {
        next = { san, kids: [] };
        cur.kids.push(next);
      }
      cur = next;
    }
  }
  const setup = startingPosition(new Map([["FEN", startFen]]));
  if (setup.isErr) throw new Error("FEN invalide");
  const render = (node: T, pos: Position, forceNumber: boolean): string => {
    if (!node.kids.length) return "";
    const [main, ...vars] = node.kids;
    const num = (p: Position, force: boolean) =>
      p.turn === "white" ? `${p.fullmoves}. ` : force ? `${p.fullmoves}... ` : "";
    const play = (child: T) => {
      const p = pos.clone();
      const m = parseSan(p, child.san);
      if (!m) return null;
      p.play(m);
      return p;
    };
    const afterMain = play(main);
    if (!afterMain) return "";
    let s = num(pos, forceNumber) + main.san;
    for (const v of vars) {
      const pv = play(v);
      if (!pv) continue;
      s += ` (${num(pos, true)}${v.san}${(() => {
        const rest = render(v, pv, false);
        return rest ? " " + rest : "";
      })()})`;
    }
    const rest = render(main, afterMain, vars.length > 0);
    return rest ? `${s} ${rest}` : s;
  };
  const head = { SetUp: "1", FEN: startFen, ...headers };
  const headerText = Object.entries(head)
    .map(([k, v]) => `[${k} "${String(v).replace(/"/g, "'")}"]`)
    .join("\n");
  return `${headerText}\n\n${render(root, setup.value, true)} *\n`;
}

/** Joue une suite de coups SAN depuis une FEN ; renvoie null si un coup est illégal. */
export function playLine(startFen: string, sans: string[]) {
  const setup = startingPosition(new Map([["FEN", startFen]]));
  if (setup.isErr) return null;
  const pos = setup.value;
  for (const san of sans) {
    const m = parseSan(pos, san);
    if (!m) return null;
    pos.play(m);
  }
  return pos;
}

export const NAG_GLYPHS: Record<number, string> = {
  1: "!",
  2: "?",
  3: "!!",
  4: "??",
  5: "!?",
  6: "?!",
  7: "□",
  10: "=",
  13: "∞",
  14: "⩲",
  15: "⩱",
  16: "±",
  17: "∓",
  18: "+−",
  19: "−+",
  22: "⨀",
  23: "⨀",
  32: "⟳",
  36: "→",
  40: "↑",
  132: "⇆",
  140: "∆",
  146: "N",
};

/** Le coup est-il marqué comme une erreur par l'auteur ($2 ?, $4 ??, $6 ?!) ? */
export const isBadNag = (nags: number[]) => nags.some((n) => n === 2 || n === 4 || n === 6);
/** Le coup est-il marqué comme bon ($1 !, $3 !!, $5 !?) ? */
export const isGoodNag = (nags: number[]) => nags.some((n) => n === 1 || n === 3);

/** Découpe un fichier PGN en exercices : arbre lisible + PGN normalisé (à stocker comme référence). */
export function splitPgnGames(text: string): { tree: GameTree; pgn: string }[] {
  return parsePgn(cleanPgnText(text)).map((g) => ({ tree: convertGame(g), pgn: makePgn(g) }));
}
