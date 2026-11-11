// Données centrales du site : contact, liens internes/externes.
export const LEGACY = "https://www.cavalierbleu.com";

export const CONTACT = {
  email: "desk@cavalierbleu.com",
  phoneFr: "06 63 73 61 45",
  phoneIntl: "+33 6 63 73 61 45",
  phoneHref: "tel:+33663736145",
};

export const mailto = (subject?: string) =>
  `mailto:${CONTACT.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

/** Lien vers la future plateforme de cours (échiquier partagé, exercices, suivi). */
export const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "";
/** Nouvel espace élève (/connexion) ouvert au public : NEXT_PUBLIC_MEMBER_AREA=1. Sinon, l'ancien espace reste la référence. */
export const MEMBER_AREA_LIVE = process.env.NEXT_PUBLIC_MEMBER_AREA === "1";

export const LINKS = {
  // Externes (inchangés par rapport à l'ancien site)
  facebook: "https://www.facebook.com/Institut-Le-Cavalier-Bleu-219878854703839/",
  olibris: "https://www.olibris.fr",
  bookPsychologie:
    "https://olibris.fr/entrainement/68-psychologie-du-joueur-d-echecs-science-et-performance-9782916340463.html",
  bookFiche50: "https://www.olibris.fr/FicheProduit.aspx?Id=50",
  atelierStratege: "https://olibris.fr/24-atelier",
  liguGuadeloupe: "https://www.facebook.com/LigueDEchecsDeGuadeloupe/",
  ffeStages: "https://www.echecs.asso.fr/ListeStages.aspx?Action=DNF",
  ffeFormation: "http://www.echecs.asso.fr/Default.aspx?Cat=6",
  // Espace étudiant de l'ancien site, conservé tant que la nouvelle plateforme n'est pas en ligne
  legacyLogin: `${LEGACY}/logtest.html`,

  // Pages internes
  modules: "/cours-a-distance",
  guide: "/guide",
  formation: "/formation",
  outils: "/pedagogie",
  faq: "/faq",
  articles: "/articles",
  inscription: "/inscription",
  espaceEtudiant: "/espace-etudiant",
  elan2026: "/elan-2026",
  conditions: "/conditions",
  liens: "/liens",
  plan: "/plan-du-site",
  institut: "/institut",
};

export const NAV = [
  { href: "/entrainement", label: "Entraînement" },
  { href: "/cours-a-distance", label: "Cours à distance" },
  { href: "/formation", label: "Formation" },
  { href: "/pedagogie", label: "Pédagogie" },
  { href: "/articles", label: "Articles" },
  { href: "/darko-anic", label: "Darko Anic" },
  { href: "/tarifs", label: "Tarifs" },
];
