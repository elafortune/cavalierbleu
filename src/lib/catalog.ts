// Catalogue des produits vendus en ligne. Les prix sont définis UNIQUEMENT ici (côté serveur) :
// le navigateur n'envoie qu'un identifiant, jamais un montant.
export type ProductCategory = "cours" | "modules" | "pedagogie" | "elan";

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Montant en centimes d'euro. */
  amount: number;
  category: ProductCategory;
  /** Produit physique : on demande une adresse de livraison. */
  shipping?: boolean;
  /** Prix barré (promotion), en centimes. */
  compareAt?: number;
};

export const PRODUCTS: Product[] = [
  // Cours individuels à distance
  { id: "cours-1h", name: "Cours individuel — 1 heure", description: "Cours particulier en direct avec le GMI Darko Anic.", amount: 6000, category: "cours" },
  { id: "cours-10h", name: "Forfait 10 heures", description: "10 heures de cours individuels à distance (49 €/h).", amount: 49000, category: "cours" },
  { id: "cours-20h", name: "Forfait 20 heures", description: "20 heures de cours individuels à distance (44,50 €/h).", amount: 89000, category: "cours" },

  // Modules d'enseignement à distance
  { id: "module-jaune", name: "Module Jaune", description: "Cycle Apprentissage · 10 dossiers · débutants.", amount: 12700, category: "modules" },
  { id: "module-orange", name: "Module Orange", description: "Cycle Apprentissage · 10 dossiers · consolidation des acquis.", amount: 18400, category: "modules" },
  { id: "module-rouge", name: "Module Rouge", description: "Cycle Apprentissage · 10 dossiers · 1300–1500 Elo.", amount: 18400, category: "modules" },
  { id: "module-vert", name: "Module Vert", description: "Cycle Perfectionnement · 14 dossiers · 1500–1700 Elo.", amount: 28700, category: "modules" },
  { id: "module-azur", name: "Module Azur", description: "Cycle Perfectionnement · 14 dossiers · 1700–1900 Elo.", amount: 28700, category: "modules" },
  { id: "module-turquoise", name: "Module Turquoise", description: "Cycle Perfectionnement · 14 dossiers · 1900–2100 Elo.", amount: 28700, category: "modules" },
  { id: "module-indigo", name: "Module Indigo", description: "Cycle Compétition · 16 dossiers thématiques · +2100 Elo.", amount: 45700, category: "modules" },

  // Fiches pédagogiques
  { id: "fiches-n1", name: "Fiches pédagogiques — Niveau 1", description: "Fascicule de cours (~200 p.) + fascicule d'exercices (~80 p.), format A4.", amount: 16900, category: "pedagogie", shipping: true },
  { id: "fiches-n2", name: "Fiches pédagogiques — Niveau 2", description: "Fascicule de cours (~200 p.) + fascicule d'exercices (~80 p.), format A4.", amount: 21900, category: "pedagogie", shipping: true },
  { id: "fiches-n1-n2", name: "Fiches pédagogiques — Niveaux 1 + 2", description: "Les deux niveaux commandés ensemble.", amount: 33900, category: "pedagogie", shipping: true },

  // Promotion ÉLAN 2026
  { id: "elan-vert-azur", name: "ÉLAN 2026 — Modules Vert + Azur", description: "2 modules du cycle Perfectionnement, -50 % sur le deuxième.", amount: 43000, compareAt: 57400, category: "elan" },
  { id: "elan-azur-turquoise", name: "ÉLAN 2026 — Modules Azur + Turquoise", description: "2 modules du cycle Perfectionnement, -50 % sur le deuxième.", amount: 43000, compareAt: 57400, category: "elan" },
  { id: "elan-vert-coaching", name: "ÉLAN 2026 — Module Vert + 3 h de coaching", description: "Suivi individuel + crédit de 3 h de coaching individuel.", amount: 37000, category: "elan" },
  { id: "elan-azur-coaching", name: "ÉLAN 2026 — Module Azur + 3 h de coaching", description: "Suivi individuel + crédit de 3 h de coaching individuel.", amount: 37000, category: "elan" },
  { id: "elan-chessbase", name: "ÉLAN 2026 — S'entraîner avec ChessBase (10 séances)", description: "Maîtriser ChessBase pour préparer son répertoire et analyser ses parties.", amount: 47000, category: "elan" },
  { id: "elan-noirs", name: "ÉLAN 2026 — Comment jouer avec les Noirs (10 séances)", description: "Construire un répertoire fiable et cohérent avec les Noirs.", amount: 47000, category: "elan" },
  { id: "elan-attaque", name: "ÉLAN 2026 — L'attaque sur le Roi (12 séances)", description: "Méthodologie fondamentale de l'attaque et patterns incontournables.", amount: 56400, category: "elan" },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
