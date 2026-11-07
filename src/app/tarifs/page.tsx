import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/FinalCta";
import { Button, Container, PageHero } from "@/components/ui";
import { formatPrice, getProduct } from "@/lib/catalog";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Tarifs des cours d'échecs, modules à distance, séminaires et formations de l'Institut Le Cavalier Bleu.",
};

type Row = { label: string; detail?: string; price: string; href: string };
type Group = { title: string; intro?: string; rows: Row[] };

const p = (id: string) => formatPrice(getProduct(id)!.amount);

const groups: Group[] = [
  {
    title: "Cours individuels à distance",
    intro: "En direct, par internet ou téléphone.",
    rows: [
      { label: "Séance d'une heure", price: p("cours-1h"), href: "/inscription#cours" },
      { label: "Forfait 10 heures", detail: "soit 49 € / h", price: p("cours-10h"), href: "/inscription#cours" },
      { label: "Forfait 20 heures", detail: "soit 44,50 € / h", price: p("cours-20h"), href: "/inscription#cours" },
      { label: "Stage intensif individuel", price: "Sur devis", href: mailto("Devis entraînement individuel") },
      { label: "Coaching", price: "Sur entretien", href: mailto("Coaching") },
    ],
  },
  {
    title: "Modules d'enseignement à distance",
    intro: "Cours, exercices et suivi personnalisé — 3 cycles, 9 modules.",
    rows: [
      { label: "Module Jaune", detail: "Apprentissage · débutants", price: p("module-jaune"), href: "/cours-a-distance#jaune" },
      { label: "Module Orange", detail: "Apprentissage · consolidation", price: p("module-orange"), href: "/cours-a-distance#orange" },
      { label: "Module Rouge", detail: "Apprentissage · 1300–1500 Elo", price: p("module-rouge"), href: "/cours-a-distance#rouge" },
      { label: "Module Vert", detail: "Perfectionnement · 1500–1700 Elo", price: p("module-vert"), href: "/cours-a-distance#vert" },
      { label: "Module Azur", detail: "Perfectionnement · 1700–1900 Elo", price: p("module-azur"), href: "/cours-a-distance#azur" },
      { label: "Module Turquoise", detail: "Perfectionnement · 1900–2100 Elo", price: p("module-turquoise"), href: "/cours-a-distance#turquoise" },
      { label: "Module Indigo", detail: "Compétition · +2100 Elo", price: p("module-indigo"), href: "/cours-a-distance#indigo" },
      { label: "Module Violet", detail: "Compétition · objectif Maître FIDE", price: "860 €", href: "/cours-a-distance#violet" },
      { label: "Module Bleu", detail: "Compétition · objectif Maître International", price: "1 460 €", href: "/cours-a-distance#bleu" },
    ],
  },
  {
    title: "Séminaires",
    rows: [
      { label: "Adultes", detail: "185 € pour le séminaire à Paris", price: "160 €", href: "/entrainement#seminaires" },
      { label: "Jeunes", detail: "155 € pour le séminaire à Paris", price: "120 €", href: "/entrainement#seminaires" },
    ],
  },
  {
    title: "Formation professionnelle (FFE)",
    rows: [
      { label: "DAFFE 1", price: "100 €", href: "/formation" },
      { label: "DAFFE 2", price: "100 €", href: "/formation" },
      { label: "DEFFE 1", price: "140 €", href: "/formation" },
      { label: "Formation continue", price: "Sur devis", href: mailto("Formation continue") },
    ],
  },
  {
    title: "Outils pédagogiques",
    intro: "Fiches pédagogiques pour enseigner le jeu d'échecs.",
    rows: [
      { label: "Niveau 1", price: p("fiches-n1"), href: "/pedagogie" },
      { label: "Niveau 2", price: p("fiches-n2"), href: "/pedagogie" },
      { label: "Niveaux 1 + 2", price: p("fiches-n1-n2"), href: "/pedagogie" },
    ],
  },
];

export default function TarifsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tarifs"
        title="Des formules claires, pour tous les niveaux"
        intro="Cours particuliers, modules à distance, séminaires et formations : retrouvez l'ensemble de nos tarifs. Paiement sécurisé en ligne par carte bancaire."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={LINKS.inscription}>S&apos;inscrire et payer en ligne</Button>
          <Button href={LINKS.elan2026} variant="secondary">
            Promotion ÉLAN 2026
          </Button>
        </div>
      </PageHero>
      <section className="py-20">
        <Container className="grid gap-8 lg:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded-3xl border border-navy-900/10 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-navy-900">{g.title}</h2>
              {g.intro && <p className="mt-1 text-sm text-muted">{g.intro}</p>}
              <ul className="mt-6 divide-y divide-navy-900/10">
                {g.rows.map((r) => (
                  <li key={r.label}>
                    <Link href={r.href} className="flex items-center justify-between gap-4 py-3.5 transition hover:text-brand-700">
                      <span>
                        <span className="font-medium text-navy-900">{r.label}</span>
                        {r.detail && <span className="block text-sm text-muted">{r.detail}</span>}
                      </span>
                      <span className="whitespace-nowrap font-serif text-lg text-navy-900">{r.price}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
