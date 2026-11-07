import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Liens échecs",
  description: "Fédérations, actualités, magazines, sites pour jouer et forums : notre sélection de liens échecs.",
};

const groups: { title: string; links: [string, string, string][] }[] = [
  {
    title: "Les fédérations",
    links: [
      ["Fédération Internationale des Échecs (FIDE)", "https://www.fide.com", "fide.com"],
      ["Fédération Française des Échecs", "https://www.echecs.asso.fr", "echecs.asso.fr"],
    ],
  },
  {
    title: "Actualités",
    links: [
      ["ChessBase", "https://www.chessbase.com", "chessbase.com"],
      ["The Week In Chess", "https://www.theweekinchess.com/twic", "theweekinchess.com"],
      ["ChessCafe", "https://www.chesscafe.com/", "chesscafe.com"],
    ],
  },
  {
    title: "Les magazines",
    links: [
      ["Europe Échecs", "https://www.europe-echecs.com", "europe-echecs.com"],
      ["New In Chess", "https://www.newinchess.com", "newinchess.com"],
    ],
  },
  {
    title: "Pour jouer",
    links: [["Playchess", "https://www.playchess.com/", "playchess.com"]],
  },
  {
    title: "Forum",
    links: [["France-Échecs", "https://www.france-echecs.com", "france-echecs.com"]],
  },
  {
    title: "Partenaires",
    links: [
      ["Éditions Olibris", "https://www.olibris.fr", "olibris.fr"],
      ["Ligue d'échecs de Guadeloupe", "https://www.facebook.com/LigueDEchecsDeGuadeloupe/", "facebook.com"],
    ],
  },
];

export default function LiensPage() {
  return (
    <>
      <PageHero eyebrow="Liens" title="Liens échecs" intro="Notre sélection de sites pour suivre l'actualité, jouer et progresser." />
      <section className="py-20">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-3xl border border-navy-900/10 bg-white p-7">
              <h2 className="font-serif text-xl text-navy-900">{g.title}</h2>
              <ul className="mt-4 space-y-3">
                {g.links.map(([name, href, host]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
                      <span className="font-medium text-navy-900 group-hover:text-brand-700">{name} ↗</span>
                      <span className="block text-xs text-muted">{host}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
