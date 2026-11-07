import type { Metadata } from "next";
import { BuyButton } from "@/components/BuyButton";
import { Container, PageHero, SectionTitle } from "@/components/ui";
import { formatPrice, getProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Promotion exceptionnelle ÉLAN 2026",
  description: "Offres ÉLAN 2026 : -50 % sur le deuxième module, modules avec coaching, formations ChessBase, répertoire avec les Noirs, attaque sur le Roi.",
};

const moduleOffers = [
  {
    title: "2 modules du cycle Perfectionnement",
    text: "Les modules conçus par le GMI Darko Anic ont aidé des générations de joueurs de tous niveaux. Réservez la suite de votre entraînement avec une remise de -50 % sur le deuxième module !",
    options: ["elan-vert-azur", "elan-azur-turquoise"],
    badge: "-50 % sur le 2e module",
  },
  {
    title: "Module + 3 heures de coaching",
    text: "En plus du suivi traditionnel (fiches de suivi individuel), un crédit de 3 heures de coaching individuel pour vous épauler dans votre parcours.",
    options: ["elan-vert-coaching", "elan-azur-coaching"],
    badge: "Nouveau",
  },
];

const trainings = [
  {
    id: "elan-chessbase",
    title: "Apprenez à vous entraîner avec ChessBase",
    sessions: "10 séances",
    text: "Maîtrisez les fonctionnalités importantes de ChessBase et apprenez à les utiliser pour améliorer votre jeu : préparation du répertoire, analyse de parties, entraînement tactique et technique.",
  },
  {
    id: "elan-noirs",
    title: "Comment jouer avec les Noirs",
    sessions: "10 séances",
    text: "Construire un répertoire fiable avec les Noirs est un pilier de votre performance en compétition. Composez vos ouvertures de manière cohérente en vous appuyant sur les parties modèles.",
  },
  {
    id: "elan-attaque",
    title: "Préparer et exécuter l'attaque sur le Roi",
    sessions: "12 séances",
    text: "La méthodologie fondamentale de l'attaque sur le Roi et ses patterns incontournables : découvrez comment les meilleurs joueurs du monde construisent leurs attaques.",
  },
];

export default function ElanPage() {
  return (
    <>
      <PageHero
        eyebrow="Promotion exceptionnelle"
        title={
          <>
            ÉLAN <span className="italic text-cyan-accent">2026</span>
          </>
        }
        intro="Une méthode d'entraînement éprouvée et bien rodée, à prix exceptionnel. Saisissez l'occasion de donner un nouvel élan à votre progression."
      />

      <section className="py-20">
        <Container>
          <SectionTitle eyebrow="Modules" title="Offres sur les modules" />
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {moduleOffers.map((o) => (
              <div key={o.title} className="flex flex-col rounded-3xl border border-navy-900/10 bg-white p-7 sm:p-8">
                <span className="w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{o.badge}</span>
                <h3 className="mt-4 font-serif text-2xl text-navy-900">{o.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{o.text}</p>
                <div className="mt-6 space-y-3">
                  {o.options.map((id) => {
                    const p = getProduct(id)!;
                    return (
                      <div key={id} className="flex flex-col gap-3 rounded-2xl bg-cream-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-navy-900">{p.name.replace("ÉLAN 2026 — ", "")}</p>
                          <p className="text-sm">
                            <span className="font-serif text-xl text-navy-900">{formatPrice(p.amount)}</span>
                            {p.compareAt && <span className="ml-2 text-muted line-through">{formatPrice(p.compareAt)}</span>}
                          </p>
                        </div>
                        <BuyButton productId={id} label="Réserver" className="sm:w-40" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-20 text-white">
        <Container>
          <SectionTitle light eyebrow="Formations" title="Formations thématiques en ligne" />
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {trainings.map((t) => {
              const p = getProduct(t.id)!;
              return (
                <div key={t.id} className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-accent">{t.sessions}</p>
                  <h3 className="mt-2 font-serif text-2xl">{t.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">{t.text}</p>
                  <p className="mt-6 font-serif text-3xl">{formatPrice(p.amount)}</p>
                  <BuyButton productId={t.id} label="S'inscrire" variant="light" className="mt-4" />
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
