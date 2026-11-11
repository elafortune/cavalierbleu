"use client";

import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Shape } from "@/lib/chess/pgn";

const LIGHT = { backgroundColor: "#e6eef7" };
const DARK = { backgroundColor: "#5b86b3" };
const SHAPE_COLORS: Record<Shape["color"], string> = {
  green: "rgba(34, 160, 90, 0.55)",
  red: "rgba(220, 60, 60, 0.55)",
  yellow: "rgba(240, 190, 40, 0.6)",
  blue: "rgba(40, 110, 220, 0.5)",
};

export type PlayedMove = { san: string; uci: string; fen: string };

/**
 * Échiquier aux couleurs du site. En mode interactif, n'accepte que les coups légaux
 * (glisser-déposer ou clic départ → clic arrivée ; promotion automatique en Dame).
 */
export function Board({
  fen,
  orientation = "white",
  interactive = false,
  onMove,
  shapes = [],
  lastMove,
  id = "board",
}: {
  fen: string;
  orientation?: "white" | "black";
  interactive?: boolean;
  onMove?: (m: PlayedMove) => void;
  shapes?: Shape[];
  lastMove?: string | null; // uci
  id?: string;
}) {
  const [selected, setSelected] = useState<Square | null>(null);
  const game = useMemo(() => {
    try {
      return new Chess(fen, { skipValidation: true });
    } catch {
      return null;
    }
  }, [fen]);

  const play = (from: string, to: string) => {
    if (!game || !interactive) return false;
    const g = new Chess(fen, { skipValidation: true });
    try {
      const m = g.move({ from, to, promotion: "q" });
      onMove?.({ san: m.san, uci: m.lan, fen: g.fen() });
      setSelected(null);
      return true;
    } catch {
      return false;
    }
  };

  const squareStyles = useMemo(() => {
    const s: Record<string, React.CSSProperties> = {};
    if (lastMove && lastMove.length >= 4) {
      s[lastMove.slice(0, 2)] = { backgroundColor: "rgba(159, 227, 247, 0.65)" };
      s[lastMove.slice(2, 4)] = { backgroundColor: "rgba(159, 227, 247, 0.85)" };
    }
    for (const sh of shapes) {
      if (sh.from === sh.to) s[sh.from] = { ...s[sh.from], boxShadow: `inset 0 0 0 4px ${SHAPE_COLORS[sh.color]}`, backgroundColor: SHAPE_COLORS[sh.color] };
    }
    if (selected && game) {
      s[selected] = { ...s[selected], backgroundColor: "rgba(26, 109, 177, 0.55)" };
      for (const m of game.moves({ square: selected, verbose: true })) {
        s[m.to] = { ...s[m.to], background: "radial-gradient(circle, rgba(13,36,64,.35) 22%, transparent 24%)" };
      }
    }
    return s;
  }, [lastMove, shapes, selected, game]);

  const arrows = shapes.filter((s) => s.from !== s.to).map((s) => ({ startSquare: s.from, endSquare: s.to, color: SHAPE_COLORS[s.color] }));
  const turn = fen.split(" ")[1] === "b" ? "b" : "w";

  return (
    <Chessboard
      options={{
        id,
        position: fen,
        boardOrientation: orientation,
        allowDragging: interactive,
        canDragPiece: ({ piece }) => interactive && piece.pieceType.startsWith(turn),
        onPieceDrop: ({ sourceSquare, targetSquare }) => (targetSquare ? play(sourceSquare, targetSquare) : false),
        onSquareClick: ({ square, piece }) => {
          if (!interactive || !game) return;
          if (selected && selected !== square && play(selected, square)) return;
          if (piece && piece.pieceType.startsWith(turn)) setSelected(square as Square);
          else setSelected(null);
        },
        squareStyles,
        arrows,
        allowDrawingArrows: true,
        lightSquareStyle: LIGHT,
        darkSquareStyle: DARK,
        animationDurationInMs: 200,
        darkSquareNotationStyle: { color: "#e6eef7", fontSize: 11 },
        lightSquareNotationStyle: { color: "#5b86b3", fontSize: 11 },
      }}
    />
  );
}
