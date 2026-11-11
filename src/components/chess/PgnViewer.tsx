"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mainLine, type GameTree } from "@/lib/chess/pgn";
import { Board } from "./Board";
import { MoveTree } from "./MoveTree";

/**
 * Échiquier d'étude : rejoue un PGN coup par coup, variantes cliquables, annotations,
 * cases et flèches colorées. Touches ← → pour naviguer.
 */
export function PgnViewer({ tree, title, startAtEnd = false, keyboard = true }: { tree: GameTree; title?: string; startAtEnd?: boolean; keyboard?: boolean }) {
  const [current, setCurrent] = useState<string | null>(() => (startAtEnd ? (mainLine(tree).at(-1)?.id ?? null) : null));
  const [french, setFrench] = useState(true);
  const [flipped, setFlipped] = useState(false);

  const node = current ? tree.nodes[current] : null;
  const fen = node?.fen ?? tree.startFen;
  const shapes = node ? node.shapes : tree.rootShapes;
  const comment = node ? node.comment : tree.rootComment;
  const orientation = (tree.sideToMove === "b") !== flipped ? "black" : "white";

  const go = useCallback(
    (where: "start" | "prev" | "next" | "end") => {
      if (where === "start") return setCurrent(null);
      if (where === "prev") return setCurrent(node?.parentId ?? null);
      if (where === "next") {
        const next = node ? node.children[0] : tree.rootChildren[0];
        if (next) setCurrent(next);
        return;
      }
      const line = mainLine(tree, node ? node.children : tree.rootChildren);
      if (line.length) setCurrent(line[line.length - 1].id);
    },
    [node, tree],
  );

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") go("prev");
      else if (e.key === "ArrowRight") go("next");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, keyboard]);

  const navBtn = "flex h-11 flex-1 items-center justify-center rounded-xl border border-navy-900/10 bg-white text-navy-900 transition hover:bg-brand-100 disabled:opacity-40";
  const variations = useMemo(() => (node ? node.children.slice(1) : tree.rootChildren.slice(1)).map((id) => tree.nodes[id]), [node, tree]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <div className="mx-auto w-full max-w-[560px] max-sm:-mx-1 max-sm:w-[calc(100%+0.5rem)]">
          <Board id="pgn-viewer" fen={fen} orientation={orientation} shapes={shapes} lastMove={node?.uci} />
        </div>
        <div className="mx-auto mt-3 flex max-w-[560px] gap-2" role="group" aria-label="Navigation dans la partie">
          <button className={navBtn} onClick={() => go("start")} disabled={!current} aria-label="Position de départ">⏮</button>
          <button className={navBtn} onClick={() => go("prev")} disabled={!current} aria-label="Coup précédent">◀</button>
          <button className={navBtn} onClick={() => go("next")} aria-label="Coup suivant">▶</button>
          <button className={navBtn} onClick={() => go("end")} aria-label="Fin de la ligne">⏭</button>
          <button className={navBtn} onClick={() => setFlipped((f) => !f)} aria-label="Retourner l'échiquier">⇅</button>
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-navy-900/10 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-navy-900">{title ?? "Solution"}</p>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={french} onChange={(e) => setFrench(e.target.checked)} className="accent-[#1a6db1]" />
            Notation française
          </label>
        </div>
        {comment && <p className="mt-3 rounded-xl bg-brand-100/60 p-3 text-sm text-navy-900">{comment}</p>}
        {variations.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Variantes possibles ici : {variations.length} (cliquez dans la liste pour les explorer)
          </p>
        )}
        <div className="mt-3 max-h-[420px] overflow-y-auto text-[15px]">
          <MoveTree nodes={tree.nodes} rootChildren={tree.rootChildren} current={current} onSelect={setCurrent} french={french} />
        </div>
      </div>
    </div>
  );
}
