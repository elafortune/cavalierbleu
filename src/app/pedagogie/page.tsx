import type { Metadata } from "next";
import Image from "next/image";
import { BuyButton } from "@/components/BuyButton";
import { FinalCta } from "@/components/FinalCta";
import { Check, Container, PageHero, SectionTitle } from "@/components/ui";
import { formatPrice, getProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Fiches pédagogiques pour enseigner les échecs",
  description:
    "Un outil professionnel pour enseigner le jeu d'échecs : programme progressif sur 2 ans, cours et exercices, par le GMI Darko Anic.",
};

const offers = [
  { id: "fiches-n1", title: "Niveau 1", text: "Initiation, règles, notions de base et techniques de mat." },
  { id: "fiches-n2", title: "Niveau 2", text: "Éléments tactiques et stratégiques, construire sa partie." },
  { id: "fiches-n1-n2", title: "Niveaux 1 + 2", text: "Deux années d'enseignement complètes, au meilleur prix.", featured: true },
];

const program = [
  {
    level: "Niveau 1",
    parts: [
      ["Initiation", ["L'échiquier et les pièces", "L'emplacement des pièces", "Le terrain, le territoire"]],
      ["Règles du jeu", ["Déplacements et prises", "Attaque sur le Roi et mat", "Partie nulle", "Petit et grand roque", "Valeur nominale et relative des pièces"]],
      ["Notions et concepts", ["Activité et valeur des pièces", "Comment commence la partie ?", "Idées générales dans les ouvertures", "Premières notions de stratégie", "Attaque, défense, destruction de la défense", "Qu'est-ce qu'une combinaison ?"]],
      ["Techniques de base", ["Mater avec la Dame, la Tour", "Mater avec 2 Fous", "Mater avec le Fou et le Cavalier", "Mater avec les pièces lourdes"]],
      ["Premiers pas vers la pratique", ["Le monde des combinaisons", "Grosses fautes en début de partie", "Fautes typiques dans l'ouverture"]],
    ],
  },
  {
    level: "Niveau 2",
    parts: [
      ["Éléments tactiques et stratégiques", ["Les caractéristiques du mat", "Comment trouver le mat ?", "Les mats typiques", "La notion d'attaque, l'attaque double", "La destruction de la défense", "Combinaisons de déviation", "Activation des pièces", "Comprendre les combinaisons"]],
      ["Construire sa partie", ["Principes de jeu dans l'ouverture", "Apprendre à faire un plan", "Du milieu de jeu vers la finale", "Attitude mentale pendant la partie"]],
    ],
  },
] as const;

export default function PedagogiePage() {
  return (
    <>
      <PageHero
        eyebrow="Pour les enseignants et les clubs"
        title={
          <>
            Les fiches pédagogiques : <span className="italic text-cyan-accent">un outil professionnel</span> pour enseigner les échecs
          </>
        }
        intro="Économisez votre temps de préparation et augmentez la qualité de vos cours, grâce à un programme progressif et structuré conçu par le GMI Darko Anic."
      />

      <section className="py-20 lg:py-28">
        <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-4">
            <Image src="/images/FP5.jpg" alt="Couvertures des fiches pédagogiques niveaux 1 et 2" width={904} height={637} />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-navy-900">L&apos;approche</h2>
              <p className="mt-3 leading-relaxed text-muted">
                Le rôle de l&apos;enseignant est de transmettre non seulement les notions et principes de base, mais
                aussi une vision plus globale, stratégique, de la pratique échiquéenne. Encore faut-il disposer d&apos;un
                support pédagogique clair et pratique.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-navy-900">Une progression continue</h2>
              <p className="mt-3 leading-relaxed text-muted">
                Les fiches assurent la progression de tous les membres du groupe : stimuler les meilleurs, inciter les
                moins forts à se dépasser. L&apos;enseignant se concentre sur l&apos;animation et exprime pleinement ses
                compétences.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream-200 py-20">
        <Container>
          <SectionTitle eyebrow="L'essentiel" title="Ce que contiennent les fiches" />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              ["Un programme progressif et flexible", "Pour organiser vos cours toute l'année scolaire, à raison d'une séance hebdomadaire."],
              ["Une panoplie d'exercices choisis", "Harmoniser les connaissances, varier la difficulté, stimuler les plus rapides et aider ceux qui sont en retard, maintenir la cohésion du groupe."],
              ["Des conseils pédagogiques", "Des remarques pédagogiques et didactiques pour suivre les objectifs fixés."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-3xl bg-white p-7">
                <h3 className="font-serif text-xl text-navy-900">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-white p-7 text-sm leading-relaxed text-ink">
            <p className="font-semibold text-navy-900">Descriptif — chaque niveau comprend :</p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2">
                <Check className="text-brand-700" />
                un fascicule d&apos;environ 200 pages (A4) : cours et exercices expliqués de manière pédagogique ;
              </li>
              <li className="flex gap-2">
                <Check className="text-brand-700" />
                un second fascicule d&apos;environ 80 pages regroupant tous les exercices — chaque fiche est un test à
                soumettre à vos élèves.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <SectionTitle eyebrow="Aperçu" title="Les programmes d'enseignement" />
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {program.map((lvl) => (
              <div key={lvl.level} className="rounded-3xl border border-navy-900/10 bg-white p-7">
                <h3 className="font-serif text-2xl text-navy-900">{lvl.level}</h3>
                <div className="mt-5 space-y-5">
                  {lvl.parts.map(([title, items]) => (
                    <div key={title}>
                      <p className="text-sm font-semibold text-brand-700">{title}</p>
                      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-2">
                        {items.map((i) => (
                          <li key={i}>· {i}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="commander" className="scroll-mt-24 bg-navy-900 py-20 text-white">
        <Container>
          <SectionTitle light eyebrow="Commander" title="Prix des fiches pédagogiques" intro="Paiement sécurisé par carte. Livraison à l'adresse de votre choix." />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {offers.map((o) => {
              const product = getProduct(o.id)!;
              return (
                <div key={o.id} className={`flex flex-col rounded-3xl p-7 ${o.featured ? "bg-white text-ink" : "border border-white/10 bg-white/5"}`}>
                  <p className={`text-sm font-semibold ${o.featured ? "text-brand-700" : "text-cyan-accent"}`}>{o.title}</p>
                  <p className="mt-2 font-serif text-4xl">{formatPrice(product.amount)}</p>
                  <p className={`mt-3 flex-1 text-sm ${o.featured ? "text-muted" : "text-white/70"}`}>{o.text}</p>
                  <BuyButton productId={o.id} label="Commander" variant={o.featured ? "dark" : "light"} className="mt-6" />
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
