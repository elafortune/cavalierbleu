import type { NextConfig } from "next";

// Anciennes URL du site (2001) → nouvelles pages, pour conserver le référencement.
const legacyRedirects: [string, string][] = [
  ["/index.html", "/"],
  ["/trainning.html", "/entrainement"],
  ["/entrainement-individuel.html", "/entrainement#individuel"],
  ["/seminares.html", "/entrainement#seminaires"],
  ["/coaching.html", "/entrainement#coaching"],
  ["/anic1.html", "/darko-anic"],
  ["/anic2.html", "/darko-anic"],
  ["/anic3.html", "/darko-anic"],
  ["/presentation.html", "/institut"],
  ["/tarifs.html", "/tarifs"],
  ["/contakt.html", "/contact"],
  ["/sommaire.html", "/cours-a-distance"],
  ["/modules.html", "/cours-a-distance"],
  ["/modules2.html", "/cours-a-distance"],
  ["/guide.html", "/guide"],
  ["/formation.html", "/formation"],
  ["/stageDEFFE.html", "/formation"],
  ["/outils.html", "/pedagogie"],
  ["/apercu.html", "/pedagogie"],
  ["/faq.html", "/faq"],
  ["/articles.html", "/articles"],
  ["/lecons/lecon001:n.html", "/articles/pion-isole"],
  ["/lecons/lecon002:n.html", "/articles/structures-asymetriques"],
  ["/lecons/lecon003:n.html", "/articles/structures-symetriques"],
  ["/lecons/lecon004:n.html", "/articles/structure-karlsbad"],
  ["/lecons/lecon005:n.html", "/articles/est-indienne-symetrique"],
  ["/lecons/lecon006:n.html", "/articles/structure-boleslavsky"],
  ["/lecons/lecon007:n.html", "/articles/est-indienne-dynamique"],
  ["/commande.html", "/inscription"],
  ["/elan2026.html", "/elan-2026"],
  ["/adherents.html", "/espace-etudiant"],
  ["/fonctionnement2.html", "/conditions"],
  ["/club.html", "/liens"],
  ["/plan.html", "/plan-du-site"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Base locale de développement (PGlite) : chargée telle quelle par Node (fichiers WASM), sans passer par le bundler.
  serverExternalPackages: ["@electric-sql/pglite"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
