import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero } from "@/components/ui";
import { ARTICLES } from "@/content/articles";

export const metadata: Metadata = { title: "Plan du site" };

const groups: { title: string; links: [string, string][] }[] = [
  {
    title: "Se former",
    links: [
      ["/entrainement", "Entraînement individuel et collectif"],
      ["/cours-a-distance", "Enseignement à distance — modules"],
      ["/guide", "Le guide : choisir son module"],
      ["/formation", "Formation professionnelle FFE"],
      ["/pedagogie", "Fiches pédagogiques"],
      ["/elan-2026", "Promotion ÉLAN 2026"],
    ],
  },
  {
    title: "L'Institut",
    links: [
      ["/", "Accueil"],
      ["/institut", "Présentation de l'Institut"],
      ["/darko-anic", "GMI Darko Anic"],
      ["/tarifs", "Tarifs"],
      ["/inscription", "Inscription et paiement"],
      ["/espace-etudiant", "Espace étudiant"],
    ],
  },
  {
    title: "Informations",
    links: [
      ["/faq", "Questions fréquentes"],
      ["/contact", "Contact"],
      ["/conditions", "Conditions"],
      ["/liens", "Liens échecs"],
    ],
  },
  { title: "Articles", links: [["/articles", "Tous les articles"], ...ARTICLES.map((a) => [`/articles/${a.slug}`, a.title] as [string, string])] },
];

export default function PlanPage() {
  return (
    <>
      <PageHero eyebrow="Plan du site" title="Toutes les pages du site" />
      <section className="py-20">
        <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="font-serif text-xl text-navy-900">{g.title}</h2>
              <ul className="mt-4 space-y-2">
                {g.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-muted hover:text-brand-700">
                      {label}
                    </Link>
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
