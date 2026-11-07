import { Chess, type Move } from "chess.js";

// Petit moteur alpha-bêta (niveau "club débutant") : matériel + tables de position simples.
const VALUES: Record<string, number> = { p: 100, n: 310, b: 330, r: 500, q: 900, k: 0 };

const CENTER = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 2, 4, 5, 5, 4, 2, 0,
  0, 4, 8, 10, 10, 8, 4, 0,
  0, 5, 10, 18, 18, 10, 5, 0,
  0, 5, 10, 18, 18, 10, 5, 0,
  0, 4, 8, 10, 10, 8, 4, 0,
  0, 2, 4, 5, 5, 4, 2, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
];

function evaluate(game: Chess): number {
  // Score du point de vue des Blancs
  if (game.isCheckmate()) return game.turn() === "w" ? -100000 : 100000;
  if (game.isDraw() || game.isStalemate()) return 0;
  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      let v = VALUES[sq.type];
      if (sq.type === "n" || sq.type === "b" || sq.type === "p") v += CENTER[r * 8 + f];
      if (sq.type === "p") v += sq.color === "w" ? (6 - r) * 4 : (r - 1) * 4; // avancée des pions
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function ordered(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    const sa = (a.captured ? VALUES[a.captured] * 10 - VALUES[a.piece] : 0) + (a.san.includes("+") ? 50 : 0);
    const sb = (b.captured ? VALUES[b.captured] * 10 - VALUES[b.piece] : 0) + (b.san.includes("+") ? 50 : 0);
    return sb - sa;
  });
}

function search(game: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);
  const moves = ordered(game.moves({ verbose: true }));
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.max(best, search(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    game.move(m);
    best = Math.min(best, search(game, depth - 1, alpha, beta, true));
    game.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

export function bestMove(fen: string, depth = 3): Move | null {
  const game = new Chess(fen);
  const moves = ordered(game.moves({ verbose: true }));
  if (!moves.length) return null;
  const white = game.turn() === "w";
  let best: Move[] = [];
  let bestScore = white ? -Infinity : Infinity;
  for (const m of moves) {
    game.move(m);
    const s = search(game, depth - 1, -Infinity, Infinity, !white) + Math.random() * 8; // un peu de variété
    game.undo();
    if ((white && s > bestScore) || (!white && s < bestScore)) {
      bestScore = s;
      best = [m];
    }
  }
  return best[0] ?? moves[0];
}
