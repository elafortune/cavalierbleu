"use client";

import { useMemo, useState } from "react";
import { linesToPgn, type MoveNode } from "@/lib/chess/pgn";
import { Board, type PlayedMove } from "./Board";
import { MoveTree } from "./MoveTree";

type Tree = { nodes: Record<string, MoveNode>; rootChildren: string[] };

const lineTo = (t: Tree, id: string | null) => {
  const out: string[] = [];
  let cur = id;
  while (cur) {
    out.unshift(t.nodes[cur].san);
    cur = t.nodes[cur].parentId;
  }
  return out;
};

/** Toutes les lignes (feuilles), suite principale d'abord. */
const allLinesOf = (t: Tree) => {
  const out: string[][] = [];
  const rec = (ids: string[]) => {
    for (const id of ids) {
      if (t.nodes[id].children.length) rec(t.nodes[id].children);
      else out.push(lineTo(t, id));
    }
  };
  rec(t.rootChildren);
  return out;
};

/**
 * Échiquier de réponse : l'élève joue les coups des deux camps, revient en arrière
 * et ajoute des variantes. La réponse est convertie en PGN (champ caché « answerPgn »).
 */
export function AnswerBoard({ startFen }: { startFen: string }) {
  const sideToMove = startFen.split(" ")[1] === "b" ? "b" : "w";
  const [tree, setTree] = useState<Tree>({ nodes: {}, rootChildren: [] });
  const [current, setCurrent] = useState<string | null>(null);
  const [french, setFrench] = useState(true);
  const [counter, setCounter] = useState(0);

  const node = current ? tree.nodes[current] : null;
  const fen = node?.fen ?? startFen;

  const onMove = (m: PlayedMove) => {
    const siblings = node ? node.children : tree.rootChildren;
    const existing = siblings.find((id) => tree.nodes[id].san === m.san);
    if (existing) return setCurrent(existing);
    const parts = fen.split(" ");
    const id = `a${counter + 1}`;
    const newNode: MoveNode = {
      id,
      parentId: current,
      ply: (node?.ply ?? 0) + 1,
      san: m.san,
      uci: m.uci,
      fen: m.fen,
      moveNumber: Number(parts[5] ?? 1),
      color: parts[1] === "b" ? "b" : "w",
      nags: [],
      shapes: [],
      children: [],
    };
    setCounter((c) => c + 1);
    setTree((t) => {
      const nodes = { ...t.nodes, [id]: newNode };
      if (current) nodes[current] = { ...nodes[current], children: [...nodes[current].children, id] };
      return { nodes, rootChildren: current ? t.rootChildren : [...t.rootChildren, id] };
    });
    setCurrent(id);
  };

  const removeFrom = (id: string) => {
    setTree((t) => {
      const nodes = { ...t.nodes };
      const drop = (x: string) => {
        nodes[x].children.forEach(drop);
        delete nodes[x];
      };
      const parent = t.nodes[id].parentId;
      drop(id);
      if (parent) nodes[parent] = { ...nodes[parent], children: nodes[parent].children.filter((c) => c !== id) };
      return { nodes, rootChildren: parent ? t.rootChildren : t.rootChildren.filter((c) => c !== id) };
    });
    setCurrent(tree.nodes[id].parentId);
  };

  const promote = (id: string) => {
    setTree((t) => {
      const parent = t.nodes[id].parentId;
      const reorder = (ids: string[]) => [id, ...ids.filter((x) => x !== id)];
      if (!parent) return { ...t, rootChildren: reorder(t.rootChildren) };
      return { ...t, nodes: { ...t.nodes, [parent]: { ...t.nodes[parent], children: reorder(t.nodes[parent].children) } } };
    });
  };

  const pgn = useMemo(() => {
    const lines = allLinesOf(tree);
    return lines.length ? linesToPgn(startFen, lines) : "";
  }, [tree, startFen]);

  const isVariation = node && (node.parentId ? tree.nodes[node.parentId].children[0] !== node.id : tree.rootChildren[0] !== node.id);
  const btn = "inline-flex min-h-10 items-center rounded-full border border-navy-900/15 px-4 text-sm font-medium text-navy-900 transition hover:bg-brand-100 disabled:opacity-40";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <input type="hidden" name="answerPgn" value={pgn} />
      <div>
        <div className="mx-auto w-full max-w-[560px] max-sm:-mx-1 max-sm:w-[calc(100%+0.5rem)]">
          <Board id="answer-board" fen={fen} interactive onMove={onMove} lastMove={node?.uci} orientation={sideToMove === "b" ? "black" : "white"} />
        </div>
        <p className="mx-auto mt-3 max-w-[560px] text-xs text-muted">
          Jouez votre solution <strong>et les réponses de l&apos;adversaire</strong>. Pour proposer une autre suite, revenez
          sur un coup de la liste et jouez un autre coup : une variante est créée.
        </p>
      </div>
      <div className="min-w-0 rounded-2xl border border-navy-900/10 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-navy-900">Votre réponse sur l&apos;échiquier</p>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={french} onChange={(e) => setFrench(e.target.checked)} className="accent-[#1a6db1]" />
            Notation française
          </label>
        </div>
        <div className="mt-3 min-h-16 text-[15px]">
          {tree.rootChildren.length ? (
            <MoveTree nodes={tree.nodes} rootChildren={tree.rootChildren} current={current} onSelect={setCurrent} french={french} />
          ) : (
            <p className="text-sm text-muted">Aucun coup joué pour l&apos;instant. Le trait est aux {sideToMove === "w" ? "Blancs" : "Noirs"}.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => setCurrent(node?.parentId ?? null)} disabled={!current}>
            ◀ Revenir
          </button>
          <button type="button" className={btn} onClick={() => setCurrent(null)} disabled={!current}>
            Position de départ
          </button>
          {isVariation && current && (
            <button type="button" className={btn} onClick={() => promote(current)}>
              En faire la suite principale
            </button>
          )}
          {current && (
            <button type="button" className={`${btn} text-red-700`} onClick={() => removeFrom(current)}>
              Effacer à partir d&apos;ici
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
