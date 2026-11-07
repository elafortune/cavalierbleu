export type Cycle = "Apprentissage" | "Perfectionnement" | "Compétition";

export type Module = {
  id: string; // ancre & suffixe produit
  name: string;
  cycle: Cycle;
  dossiers: string;
  level: string;
  color: string; // pastille
  description: string[];
  productId?: string; // vendu en ligne
  price: string;
};

export const MODULES: Module[] = [
  {
    id: "jaune",
    name: "Module Jaune",
    cycle: "Apprentissage",
    dossiers: "10 dossiers",
    level: "Débutants",
    color: "#f2c94c",
    description: [
      "Destiné aux débutants et faux débutants (qui ne maîtrisent pas encore parfaitement le déplacement des pièces), ce module traite des règles du jeu, des mats basiques et d'une multitude de positions utiles pour bien comprendre la logique échiquéenne la plus simple.",
      "Vous apprendrez petit à petit à orienter votre réflexion en fonction d'une position donnée.",
    ],
    productId: "module-jaune",
    price: "127 €",
  },
  {
    id: "orange",
    name: "Module Orange",
    cycle: "Apprentissage",
    dossiers: "10 dossiers",
    level: "Consolidation des acquis",
    color: "#f2994a",
    description: [
      "Le module Orange vous introduit dans la magie de la combinaison. Nous démontons ensemble les mécanismes qui régissent l'art de la tactique : reconnaître les images de mat ou de pat, savoir comment et à quel moment activer ses pièces, préparer des combinaisons simples, attaquer… ou encore comprendre les principes qui nous guident dès l'ouverture.",
      "Ce module vous prépare à aborder sereinement les contenus techniques et stratégiques du module suivant.",
    ],
    productId: "module-orange",
    price: "184 €",
  },
  {
    id: "rouge",
    name: "Module Rouge",
    cycle: "Apprentissage",
    dossiers: "10 dossiers",
    level: "1300 – 1500 Elo",
    color: "#eb5757",
    description: [
      "Ce module vous enseigne la base théorique des finales, approfondit le mécanisme de la combinaison et introduit de nouveaux thèmes tactiques, aborde la question du plan et approfondit les principes généraux du jeu dans les ouvertures.",
      "Vous accédez ainsi à une dimension du jeu dont vous n'aviez pas idée au départ, et découvrez des subtilités qui attiseront votre désir d'étudier et votre plaisir de jouer.",
    ],
    productId: "module-rouge",
    price: "184 €",
  },
  {
    id: "vert",
    name: "Module Vert",
    cycle: "Perfectionnement",
    dossiers: "14 dossiers",
    level: "1500 – 1700 Elo",
    color: "#27ae60",
    description: [
      "Aborde les éléments fondateurs de la stratégie, élargit la compréhension thématique des combinaisons et du jeu tactique, spécifie et concrétise les principes du jeu dans l'ouverture.",
      "Vous consolidez vos bases quant à la technique des finales et approfondissez l'ensemble de vos acquis pour continuer à aller de l'avant !",
    ],
    productId: "module-vert",
    price: "287 €",
  },
  {
    id: "azur",
    name: "Module Azur",
    cycle: "Perfectionnement",
    dossiers: "14 dossiers",
    level: "1700 – 1900 Elo · objectif 2000",
    color: "#2d9cdb",
    description: [
      "Le niveau élevé de ce module requiert des bases solides dans le domaine des finales et la connaissance des thèmes tactiques. L'accent est plus particulièrement mis sur la compréhension de la stratégie : vous étudiez la manière dont la structure de pions détermine la conception d'un plan.",
      "Ce module ouvre également sur la méthodologie de préparation d'une ouverture.",
    ],
    productId: "module-azur",
    price: "287 €",
  },
  {
    id: "turquoise",
    name: "Module Turquoise",
    cycle: "Perfectionnement",
    dossiers: "14 dossiers",
    level: "1900 – 2100 Elo",
    color: "#1abc9c",
    description: [
      "Nécessite des prérequis : une solide connaissance des techniques dans les finales ainsi qu'une bonne maîtrise du jeu tactique.",
      "Vous étudiez les méthodes d'attaque et de défense, les finales complexes, approfondissez le jeu positionnel, l'évaluation de la position, la construction des plans. Vous renforcez vos capacités d'analyse et de calcul.",
    ],
    productId: "module-turquoise",
    price: "287 €",
  },
  {
    id: "indigo",
    name: "Module Indigo",
    cycle: "Compétition",
    dossiers: "16 dossiers thématiques",
    level: "+2100 Elo",
    color: "#4b4fc4",
    description: [
      "S'adresse à des joueurs très expérimentés. Les dossiers thématiques traitent en profondeur des techniques de finales, des méthodes d'attaque et de défense, des différentes stratégies dans l'ouverture, le milieu de jeu et les finales.",
      "Vous devenez plus autonome dans l'évaluation d'une position et plus précis dans vos calculs. Le choix des coups et la prise de décision sont davantage en adéquation avec la position : votre assurance s'en trouve renforcée.",
    ],
    productId: "module-indigo",
    price: "457 €",
  },
  {
    id: "violet",
    name: "Module Violet",
    cycle: "Compétition",
    dossiers: "18 dossiers",
    level: "Objectif Maître FIDE",
    color: "#8e44ad",
    description: ["Un programme d'entraînement de haut niveau, construit avec vous après un entretien avec le GMI Darko Anic."],
    price: "860 €",
  },
  {
    id: "bleu",
    name: "Module Bleu",
    cycle: "Compétition",
    dossiers: "20 dossiers",
    level: "Objectif Maître International",
    color: "#1a6db1",
    description: ["Le sommet du cursus : un accompagnement exigeant vers la norme de Maître International, sur entretien préalable."],
    price: "1 460 €",
  },
];

export const CYCLES: { name: Cycle; intro: string }[] = [
  { name: "Apprentissage", intro: "Des règles du jeu aux premières combinaisons : poser des bases justes et solides." },
  { name: "Perfectionnement", intro: "Stratégie, plans et finales : franchir le cap des 2000 Elo." },
  { name: "Compétition", intro: "Dossiers thématiques de haut niveau, jusqu'à l'objectif Maître International." },
];
