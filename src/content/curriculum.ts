// Structure des modules d'enseignement à distance : relevée sur l'ancien espace étudiant
// (pages espace-clients/<module>/aideN.html, analyse du 10/11/2026).
// Les exercices ont une numérotation globale continue (0001 → 2396).
// Ce fichier fait référence pour le squelette en base (npm run db:seed) : les contenus réels
// (PGN, PDF, corrections) viennent ensuite s'y accrocher par numéro d'exercice.

export type DossierDef = { code: string; label: string; from: number; to: number };
export type ModuleDef = {
  id: string; // = MODULES[].id (src/content/modules.ts) et suffixe du produit Stripe "module-<id>"
  name: string;
  order: number;
  /** Lettre utilisée dans les références d'exercices (ex. « MV-0825 » = Module Vert). */
  letter: string;
  dossiers: DossierDef[];
};

const d = (code: string, from: number, to: number): DossierDef => ({
  code,
  label: /^N\d+$/.test(code) ? `Dossier n°${code.slice(1)}` : code,
  from,
  to,
});

export const CURRICULUM: ModuleDef[] = [
  {
    id: "jaune",
    name: "Module Jaune",
    order: 1,
    letter: "J",
    // Découpage en dossiers inconnu (page d'aide absente) : un dossier unique en attendant.
    dossiers: [d("N1", 1, 252)],
  },
  {
    id: "orange",
    name: "Module Orange",
    order: 2,
    letter: "O",
    dossiers: [d("N1", 253, 280), d("N2", 281, 308), d("N3", 309, 336), d("N4", 337, 364), d("DTC", 365, 396), d("N5", 397, 424), d("N6", 425, 452), d("N7", 453, 480), d("N8", 481, 512), d("EXE", 513, 552)],
  },
  {
    id: "rouge",
    name: "Module Rouge",
    order: 3,
    letter: "R",
    dossiers: [d("N1", 553, 580), d("N2", 581, 604), d("N3", 605, 628), d("N4", 629, 652), d("DTC", 653, 684), d("N5", 685, 708), d("N6", 709, 732), d("N7", 733, 756), d("N8", 757, 784), d("EXE", 785, 824)],
  },
  {
    id: "vert",
    name: "Module Vert",
    order: 4,
    letter: "V",
    dossiers: [d("N1", 825, 848), d("N2", 849, 876), d("N3", 877, 904), d("N4", 905, 928), d("N5", 929, 952), d("N6", 953, 976), d("DTC", 977, 1008), d("N7", 1009, 1032), d("N8", 1033, 1060), d("N9", 1061, 1084), d("N10", 1085, 1108), d("N11", 1109, 1136), d("N12", 1137, 1164), d("EXE", 1165, 1204)],
  },
  {
    id: "azur",
    name: "Module Azur",
    order: 5,
    letter: "A",
    dossiers: [d("N1", 1205, 1224), d("N2", 1225, 1248), d("N3", 1249, 1272), d("N4", 1273, 1296), d("N5", 1297, 1320), d("N6", 1321, 1348), d("DTC", 1349, 1384), d("N7", 1385, 1412), d("N8", 1413, 1440), d("N9", 1441, 1468), d("N10", 1469, 1496), d("N11", 1497, 1520), d("N12", 1521, 1548), d("EXE", 1549, 1588)],
  },
  {
    id: "turquoise",
    name: "Module Turquoise",
    order: 6,
    letter: "T",
    dossiers: [d("N1", 1589, 1608), d("N2", 1609, 1632), d("N3", 1633, 1660), d("N4", 1661, 1684), d("N5", 1685, 1708), d("N6", 1709, 1732), d("DTC", 1733, 1764), d("N7", 1765, 1788), d("N8", 1789, 1808), d("N9", 1809, 1836), d("N10", 1837, 1864), d("N11", 1865, 1892), d("N12", 1893, 1920), d("EXE", 1921, 1960)],
  },
  {
    id: "indigo",
    name: "Module Indigo",
    order: 7,
    letter: "I",
    dossiers: [d("N1", 1961, 1980), d("N2", 1981, 2004), d("N3", 2005, 2028), d("N4", 2029, 2052), d("N5", 2053, 2072), d("N6", 2073, 2100), d("N7", 2101, 2128), d("DTC", 2129, 2160), d("N8", 2161, 2188), d("N9", 2189, 2216), d("N10", 2217, 2244), d("N11", 2245, 2272), d("N12", 2273, 2300), d("N13", 2301, 2328), d("N14", 2329, 2356), d("EXE", 2357, 2396)],
  },
  // Violet et Bleu : absents de l'ancien espace en ligne — modules créés sans exercices.
  { id: "violet", name: "Module Violet", order: 8, letter: "W", dossiers: [] },
  { id: "bleu", name: "Module Bleu", order: 9, letter: "B", dossiers: [] },
];

export const moduleOfExercise = (n: number) =>
  CURRICULUM.find((m) => m.dossiers.some((x) => n >= x.from && n <= x.to));

export const dossierOfExercise = (n: number) => {
  const m = moduleOfExercise(n);
  const dossier = m?.dossiers.find((x) => n >= x.from && n <= x.to);
  return m && dossier ? { module: m, dossier, index: n - dossier.from + 1 } : undefined;
};

export const formatExerciseNumber = (n: number) => String(n).padStart(4, "0");
