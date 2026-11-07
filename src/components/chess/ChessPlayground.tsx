"use client";

import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { bestMove } from "@/lib/engine";
import { PUZZLES } from "@/lib/puzzles";
import { mailto } from "@/lib/site";

type Mode = "puzzle" | "play";
type Feedback = { tone: "info" | "success" | "error"; text: string };

const LIGHT = { backgroundColor: "#e6eef7" };
const DARK = { backgroundColor: "#5b86b3" };

export function ChessPlayground({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("puzzle");
  const game = useRef(new Chess(PUZZLES[0].fen));
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({
    tone: "info",
    text: "Les Blancs jouent et matent. Déplacez une pièce (glisser ou cliquer).",
  });
  const timers = useRef<number[]>([]);

  const puzzle = PUZZLES[puzzleIdx];

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const sync = useCallback(() => setFen(game.current.fen()), []);

  const loadPuzzle = useCallback(
    (idx: number) => {
      clearTimers();
      const p = PUZZLES[idx];
      game.current = new Chess(p.fen);
      setPuzzleIdx(idx);
      setStep(0);
      setSolved(false);
      setSelected(null);
      setLastMove(null);
      setFeedback({ tone: "info", text: `${p.theme} — les Blancs jouent. Trouvez le coup décisif.` });
      sync();
    },
    [sync],
  );

  const newGame = useCallback(() => {
    clearTimers();
    game.current = new Chess();
    setSelected(null);
    setLastMove(null);
    setThinking(false);
    setFeedback({ tone: "info", text: "Vous avez les Blancs. À vous de jouer !" });
    sync();
  }, [sync]);

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    if (m === "puzzle") loadPuzzle(puzzleIdx);
    else newGame();
  };

  const gameOverText = (g: Chess) => {
    if (g.isCheckmate()) return g.turn() === "w" ? "Échec et mat — l'ordinateur l'emporte." : "Échec et mat ! Bravo, vous avez gagné.";
    if (g.isStalemate()) return "Pat : partie nulle.";
    if (g.isDraw()) return "Partie nulle.";
    return null;
  };

  const computerReply = useCallback(() => {
    setThinking(true);
    const t = window.setTimeout(() => {
      const m = bestMove(game.current.fen(), 3);
      if (m) {
        game.current.move(m);
        setLastMove([m.from, m.to]);
        sync();
      }
      setThinking(false);
      const over = gameOverText(game.current);
      setFeedback(
        over
          ? { tone: game.current.turn() === "b" ? "success" : "error", text: over }
          : { tone: "info", text: game.current.inCheck() ? "Échec ! À vous de jouer." : "À vous de jouer." },
      );
    }, 350);
    timers.current.push(t);
  }, [sync]);

  const tryMove = useCallback(
    (from: string, to: string): boolean => {
      const g = game.current;
      if (g.turn() !== "w" || thinking) return false;
      if (mode === "puzzle" && solved) return false;

      let move;
      try {
        move = g.move({ from, to, promotion: "q" });
      } catch {
        return false;
      }
      setSelected(null);

      if (mode === "play") {
        setLastMove([from, to]);
        sync();
        const over = gameOverText(g);
        if (over) setFeedback({ tone: "success", text: over });
        else computerReply();
        return true;
      }

      // Mode exercice
      const expected = puzzle.solution[step];
      const uci = move.from + move.to;
      const isLast = step === puzzle.solution.length - 1;
      if (uci === expected || (isLast && g.isCheckmate())) {
        setLastMove([from, to]);
        sync();
        const next = step + 1;
        if (next >= puzzle.solution.length) {
          setSolved(true);
          setFeedback({ tone: "success", text: `Bravo, c'est mat ! ${puzzle.lesson}` });
          return true;
        }
        setFeedback({ tone: "info", text: "Bon coup ! L'adversaire répond…" });
        const t = window.setTimeout(() => {
          const reply = puzzle.solution[next];
          g.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: "q" });
          setLastMove([reply.slice(0, 2), reply.slice(2, 4)]);
          setStep(next + 1);
          sync();
          setFeedback({ tone: "info", text: "À vous : terminez le travail." });
        }, 550);
        timers.current.push(t);
        setStep(next);
        return true;
      }

      g.undo();
      sync();
      setFeedback({ tone: "error", text: "Ce n'est pas le meilleur coup. Cherchez encore — ou demandez un indice." });
      return false;
    },
    [mode, puzzle, step, solved, thinking, sync, computerReply],
  );

  const onSquareClick = ({ square, piece }: { square: string; piece: { pieceType: string } | null }) => {
    const g = game.current;
    if (selected) {
      if (selected === square) return setSelected(null);
      const ok = tryMove(selected, square);
      if (ok) return;
    }
    if (piece && piece.pieceType.startsWith("w") && g.turn() === "w") setSelected(square as Square);
    else setSelected(null);
  };

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      styles[lastMove[0]] = { backgroundColor: "rgba(159, 227, 247, 0.55)" };
      styles[lastMove[1]] = { backgroundColor: "rgba(159, 227, 247, 0.75)" };
    }
    if (selected) {
      styles[selected] = { backgroundColor: "rgba(255, 214, 102, 0.75)" };
      const g = new Chess(fen);
      for (const m of g.moves({ square: selected, verbose: true })) {
        styles[m.to] = {
          ...styles[m.to],
          backgroundImage: m.captured
            ? "radial-gradient(circle, transparent 58%, rgba(13,36,64,0.45) 60%)"
            : "radial-gradient(circle, rgba(13,36,64,0.35) 18%, transparent 20%)",
        };
      }
    }
    return styles;
  }, [lastMove, selected, fen]);

  const toneClass = {
    info: "border-white/10 bg-white/5 text-white/85",
    success: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
    error: "border-rose-300/30 bg-rose-400/10 text-rose-100",
  }[feedback.tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-navy-900/70 p-3 shadow-2xl shadow-navy-950/50 backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div role="tablist" aria-label="Mode de jeu" className="inline-flex rounded-full bg-white/5 p-1 text-sm">
          {(
            [
              ["puzzle", "Défi tactique"],
              ["play", "Jouer contre l'IA"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition sm:px-3.5 ${
                mode === m ? "bg-cyan-accent font-semibold text-navy-950" : "text-white/70 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "puzzle" && (
          <span className="text-xs text-white/50">
            {puzzleIdx + 1} / {PUZZLES.length}
          </span>
        )}
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="font-serif text-lg text-white">{mode === "puzzle" ? puzzle.title : "Partie libre"}</p>
        <span className="rounded-full border border-cyan-accent/30 px-2.5 py-0.5 text-xs text-cyan-accent">
          {mode === "puzzle" ? puzzle.theme : "Vous jouez les Blancs"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
        <Chessboard
          options={{
            id: "cavalier-bleu-board",
            position: fen,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare ? tryMove(sourceSquare, targetSquare) : false,
            onSquareClick,
            canDragPiece: ({ piece }) => piece.pieceType.startsWith("w"),
            squareStyles,
            lightSquareStyle: LIGHT,
            darkSquareStyle: DARK,
            animationDurationInMs: 220,
            darkSquareNotationStyle: { color: "#e6eef7", fontSize: 11 },
            lightSquareNotationStyle: { color: "#5b86b3", fontSize: 11 },
          }}
        />
      </div>

      <p aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${toneClass}`}>
        {thinking ? "L'ordinateur réfléchit…" : feedback.text}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {mode === "puzzle" ? (
          <>
            {!solved && (
              <button
                onClick={() => setFeedback({ tone: "info", text: `Indice : ${puzzle.hint}` })}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Indice
              </button>
            )}
            <button
              onClick={() => loadPuzzle(puzzleIdx)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Recommencer
            </button>
            <button
              onClick={() => loadPuzzle((puzzleIdx + 1) % PUZZLES.length)}
              className="ml-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-cyan-accent"
            >
              Exercice suivant →
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (thinking) return;
                const g = game.current;
                if (g.history().length >= 2) {
                  g.undo();
                  g.undo();
                  setLastMove(null);
                  sync();
                  setFeedback({ tone: "info", text: "Coup annulé. À vous de jouer." });
                }
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Annuler le coup
            </button>
            <button
              onClick={newGame}
              className="ml-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-cyan-accent"
            >
              Nouvelle partie
            </button>
          </>
        )}
      </div>

      {!compact && (
        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
          Envie d&apos;aller plus loin ? Le GMI Darko Anic analyse vos parties en cours individuel.{" "}
          <a href={mailto("Cours individuel")} className="text-cyan-accent underline-offset-2 hover:underline">
            Demander un cours d&apos;essai
          </a>
        </p>
      )}
    </div>
  );
}
