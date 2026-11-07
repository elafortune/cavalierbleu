export type Puzzle = {
  title: string;
  theme: string;
  fen: string;
  /** Coups en notation UCI, en alternance joueur / adversaire. */
  solution: string[];
  hint: string;
  lesson: string;
};

// Chaque solution a été vérifiée avec chess.js (mat forcé, premier coup unique).
export const PUZZLES: Puzzle[] = [
  {
    title: "Le mat du couloir",
    theme: "Mat en 1",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    solution: ["d1d8"],
    hint: "Le roi noir est prisonnier de ses propres pions.",
    lesson: "Pensez toujours à « faire de l'air » à votre roi : la dernière rangée est un piège classique.",
  },
  {
    title: "Le coup du berger",
    theme: "Mat en 1",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["f3f7"],
    hint: "La case f7 n'est défendue que par le roi.",
    lesson: "Dès l'ouverture, f7 (et f2) sont les points faibles : surveillez-les.",
  },
  {
    title: "Le mat à l'étouffée",
    theme: "Mat en 1",
    fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    solution: ["g5f7"],
    hint: "Le roi n'a aucune case de fuite… seul un cavalier peut l'atteindre.",
    lesson: "Un roi entouré de ses propres pièces est vulnérable aux échecs du cavalier.",
  },
  {
    title: "Sacrifice de dame",
    theme: "Mat en 2",
    fen: "r1b2k1r/ppp1bppp/8/1B1Q4/5q2/2P5/PPP2PPP/R3R1K1 w - - 1 1",
    solution: ["d5d8", "e7d8", "e1e8"],
    hint: "Attirez une pièce noire sur d8 pour ouvrir la colonne e.",
    lesson: "Le sacrifice de déviation : on donne la dame pour libérer une ligne décisive.",
  },
];
