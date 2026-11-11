"use client";

import { Fragment } from "react";
import { sanToFrench } from "@/lib/chess/french";
import { NAG_GLYPHS, type MoveNode } from "@/lib/chess/pgn";

type Props = {
  nodes: Record<string, MoveNode>;
  rootChildren: string[];
  current: string | null;
  onSelect: (id: string) => void;
  french: boolean;
};

const glyphs = (nags: number[]) => nags.map((n) => NAG_GLYPHS[n] ?? "").join("");

/** Liste des coups avec variantes entre parenthèses, cliquable (style livre d'échecs). */
export function MoveTree({ nodes, rootChildren, current, onSelect, french }: Props) {
  const san = (n: MoveNode) => (french ? sanToFrench(n.san) : n.san);

  const MoveButton = ({ n, forceNumber }: { n: MoveNode; forceNumber: boolean }) => (
    <>
      {n.preComment && <span className="text-sm italic text-muted"> {n.preComment} </span>}
      {(n.color === "w" || forceNumber) && (
        <span className="text-muted">
          {n.moveNumber}
          {n.color === "w" ? "." : "..."}
        </span>
      )}
      <button
        type="button"
        onClick={() => onSelect(n.id)}
        className={`mx-0.5 rounded px-1 py-0.5 font-medium transition ${
          current === n.id ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-brand-100"
        }`}
        aria-current={current === n.id ? "step" : undefined}
      >
        {san(n)}
        {n.nags.length > 0 && <span className={current === n.id ? "text-cyan-accent" : "text-brand-700"}>{glyphs(n.nags)}</span>}
      </button>
      {n.comment && <span className="text-sm text-muted"> {n.comment} </span>}
    </>
  );

  // Rend une suite à partir d'une liste d'enfants : le premier est la suite principale, les autres des variantes.
  const Line = ({ ids, forceNumber, depth }: { ids: string[]; forceNumber: boolean; depth: number }) => {
    if (!ids.length) return null;
    const [main, ...vars] = ids.map((id) => nodes[id]);
    return (
      <>
        <MoveButton n={main} forceNumber={forceNumber} />
        {vars.map((v) => (
          <span key={v.id} className={depth === 0 ? "my-1 block border-l-2 border-brand-200 pl-3 text-[0.95em]" : "text-[0.95em]"}>
            {depth > 0 && " ("}
            <Line ids={[v.id]} forceNumber depth={depth + 1} />
            {depth > 0 && ") "}
          </span>
        ))}
        <Fragment>
          {" "}
          <Line ids={main.children} forceNumber={vars.length > 0 || Boolean(main.comment)} depth={depth} />
        </Fragment>
      </>
    );
  };

  if (!rootChildren.length) return <p className="text-sm text-muted">Aucun coup.</p>;
  return (
    <div className="leading-8">
      <Line ids={rootChildren} forceNumber depth={0} />
    </div>
  );
}
