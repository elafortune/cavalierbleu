import Image from "next/image";
import Link from "next/link";
import { ChessPlayground } from "@/components/chess/ChessPlayground";
import { Button, Check, Container, Eyebrow, SectionTitle } from "@/components/ui";
import { LINKS, mailto } from "@/lib/site";
import { FinalCta } from "@/components/FinalCta";
import { Testimonials } from "@/components/Testimonials";

const stats = [
  { value: "GMI", label: "Grand-Maître International depuis 1999" },
  { value: "1997", label: "Vice-Champion de France" },
  { value: "1995", label: "Fondation de l'Institut" },
  { value: "5 000+", label: "Exercices d'entraînement" },
];

const offers = [
  {
    title: "Cours individuel à distance",
    text: "En direct par internet ou téléphone. Un enseignement personnalisé, quel que soit votre niveau.",
    price: "dès 44,50 € / h",
    href: "/entrainement#individuel",
    tag: "Le plus demandé",
  },
  {
    title: "Coaching de compétition",
    text: "Préparation mentale et stratégie de parcours pour atteindre des objectifs précis, dans un temps donné.",
    price: "Sur entretien",
    href: "/entrainement#coaching",
  },
  {
    title: "Stage intensif individuel",
    text: "Ouvertures, calcul, finales, préparation psychologique : un programme construit après un bilan.",
    price: "Sur devis",
    href: "/entrainement#stage",
  },
  {
    title: "Modules d'enseignement à distance",
    text: "9 modules en 3 cycles, du débutant à l'objectif Maître International, avec suivi personnalisé.",
    price: "dès 129 €",
    href: LINKS.modules,
  },
  {
    title: "Séminaires",
    text: "Une session par mois, à Montpellier ou à la demande des clubs : finales, tactique, ouvertures…",
    price: "dès 120 €",
    href: "/entrainement#seminaires",
  },
  {
    title: "Formation diplômante FFE",
    text: "DIFFE, DAFFE, DEFFE : formez les animateurs et entraîneurs de votre club avec un Maître-Entraîneur.",
    price: "Agréée FFE",
    href: LINKS.formation,
  },
];

const strategeSteps = [
  "Maîtriser les notions de base",
  "Reconnaître la nature de la position",
  "Identifier les priorités et définir l'objectif",
  "Faire des choix et élaborer un plan stratégique",
  "Passer à l'action",
  "Garder le cap ou s'adapter aux changements",
  "Rester aligné sur son intuition et son style",
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-hero relative overflow-hidden text-white">
        <div className="grid-pattern absolute inset-0" aria-hidden />
        <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <Eyebrow light>Institut Le Cavalier Bleu · depuis 1995</Eyebrow>
            <h1 className="mt-5 font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
              Progressez aux échecs avec un{" "}
              <span className="italic text-cyan-accent">Grand-Maître International</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Cours particuliers en ligne, coaching de compétition et modules d&apos;entraînement conçus par
              le GMI Darko Anic, Maître-Entraîneur de la Fédération Française des Échecs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={mailto("Demande de cours d'essai")}>Demander un cours d&apos;essai</Button>
              <Button href="/entrainement" variant="secondary">
                Découvrir les formules
              </Button>
            </div>
            <ul className="mt-10 grid max-w-lg gap-3 text-sm text-white/80 sm:grid-cols-2">
              {["Tous niveaux, du débutant au compétiteur", "Cours en direct depuis chez vous", "Méthode éprouvée depuis 30 ans", "Suivi individuel personnalisé"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 text-cyan-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[520px]">
            <ChessPlayground />
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section className="border-b border-navy-900/10 bg-white">
        <Container className="grid grid-cols-2 divide-navy-900/10 py-10 lg:grid-cols-4 lg:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-4 text-center">
              <p className="font-serif text-3xl text-brand-700 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* OFFRES */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionTitle
            eyebrow="Nos formules"
            title="Un parcours pour chaque joueur"
            intro="Du premier coup à la norme de Maître, l'Institut couvre tous les besoins de formation et d'enseignement des échecs — à distance comme en présentiel."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <Link
                key={o.title}
                href={o.href}
                className="group relative flex flex-col rounded-2xl border border-navy-900/10 bg-white p-7 transition hover:-translate-y-1 hover:border-brand-700/40 hover:shadow-xl hover:shadow-brand-700/10"
              >
                {o.tag && (
                  <span className="absolute right-5 top-5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {o.tag}
                  </span>
                )}
                <h3 className="pr-24 font-serif text-xl text-navy-900">{o.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{o.text}</p>
                <div className="mt-6 flex items-center justify-between border-t border-navy-900/10 pt-4">
                  <span className="text-sm font-semibold text-navy-900">{o.price}</span>
                  <span className="text-sm text-brand-700 transition group-hover:translate-x-1">En savoir plus →</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            Vous hésitez ?{" "}
            <a href={LINKS.guide} className="font-semibold text-brand-700 hover:underline">
              Le guide pour bien choisir son module d&apos;entraînement
            </a>
          </p>
        </Container>
      </section>

      {/* DARKO */}
      <section className="bg-navy-900 py-20 text-white lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-700/40 to-cyan-accent/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl bg-white p-3">
              <Image
                src="/images/darko-echiquier.jpg"
                alt="Le Grand-Maître International Darko Anic devant un échiquier"
                width={260}
                height={180}
                className="aspect-[13/9] w-full rounded-2xl object-cover"
              />
            </div>
            <figure className="relative mt-6 border-l-2 border-cyan-accent pl-5">
              <blockquote className="font-serif text-xl italic text-white/90">
                « Dans chaque victoire se cache une future défaite… »
              </blockquote>
              <figcaption className="mt-2 text-sm text-white/50">Darko Anic</figcaption>
            </figure>
          </div>
          <div>
            <SectionTitle
              light
              eyebrow="Votre entraîneur"
              title="Darko Anic, Grand-Maître International et pédagogue"
              intro="Champion de Croatie, Vice-Champion de France, entraîneur des équipes de France jeunes et formateur des entraîneurs de la FFE : Darko met 40 ans d'expérience au service de votre progression."
            />
            <ul className="mt-8 space-y-3 text-white/85">
              {[
                "Grand-Maître International (1999) — Vice-Champion de France 1997",
                "Maître-Entraîneur diplômé de la Fédération Française des Échecs",
                "Maîtrise en sciences sociales (psychologie, pédagogie, sociologie), Université de Zagreb",
                "Capitaine et sélectionneur de l'Équipe de France aux Olympiades 2004",
                "Auteur de 9 modules d'études et de plus de 5 000 exercices",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 text-cyan-accent" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/darko-anic">Lire son parcours</Button>
              <Button href={mailto("Coaching")} variant="secondary">
                Demander un entretien
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Testimonials limit={3} />

      {/* PROGRAMME STRATEGE */}
      <section className="py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <a
            href={LINKS.atelierStratege}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mx-auto block max-w-sm"
          >
            <Image
              src="/images/Devenez_Stratege_v1.jpg"
              alt="Affiche du programme de coaching « Déclic stratégique » — Devenez un stratège accompli aux échecs"
              width={827}
              height={1170}
              className="rounded-2xl shadow-2xl shadow-navy-900/25 transition group-hover:-translate-y-1"
            />
          </a>
          <div>
            <SectionTitle
              eyebrow="Séminaires, conférences, webinaires"
              title="Devenez un stratège accompli aux échecs"
              intro="Programme de coaching collectif « Déclic stratégique » : 7 mois, 4 séances par mois, et un coffret numérique des 28 séances enregistrées, accessible à vie."
            />
            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {strategeSteps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 rounded-xl border border-navy-900/10 bg-white p-4">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-snug text-navy-900">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button href={LINKS.atelierStratege} variant="dark">
                S&apos;inscrire au programme
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* LIVRE */}
      <section className="bg-cream-200 py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionTitle
              eyebrow="Actualité de l'Institut · Science et performance"
              title="Psychologie du joueur d'échecs"
              intro={
                <>
                  Le livre co-écrit par Philippe Chassy, docteur en psychologie et chercheur à la Hope University
                  de Liverpool, et le GMI Darko Anic. Recommandé par la Fédération Française des Échecs, publié
                  aux éditions Olibris.
                </>
              }
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={LINKS.bookPsychologie} variant="dark">
                Découvrir le livre
              </Button>
              <Button href={LINKS.olibris} variant="ghost">
                Éditions Olibris
              </Button>
            </div>
          </div>
          <a href={LINKS.bookPsychologie} target="_blank" rel="noopener noreferrer" className="group mx-auto block max-w-xs">
            <Image
              src="/images/300.jpg"
              alt="Couverture du livre Psychologie du joueur d'échecs, Science et performance"
              width={543}
              height={692}
              className="rotate-2 rounded-lg shadow-2xl shadow-navy-900/30 transition group-hover:rotate-0"
            />
          </a>
        </Container>
      </section>

      {/* PEDAGOGIE */}
      <section className="py-20 lg:py-28">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <a href={LINKS.outils} className="group block overflow-hidden rounded-2xl border border-navy-900/10 bg-white p-4">
            <Image
              src="/images/FP5.jpg"
              alt="Fiches pédagogiques niveaux 1 et 2 du GMI Darko Anic"
              width={904}
              height={637}
              className="transition group-hover:scale-[1.02]"
            />
          </a>
          <div>
            <SectionTitle
              eyebrow="Pour les enseignants et les clubs"
              title="Un outil professionnel pour enseigner le jeu d'échecs"
              intro="Les fiches pédagogiques (niveaux 1 et 2) font gagner un temps précieux aux animateurs et entraîneurs dans la préparation de leurs cours."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={LINKS.outils} variant="dark">
                Voir les fiches pédagogiques
              </Button>
              <Button href={LINKS.formation} variant="ghost">
                Formations diplômantes FFE
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* PROMO + PARTENAIRES */}
      <section className="pb-20 lg:pb-28">
        <Container>
          <a
            href={LINKS.elan2026}
            className="bg-hero group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl p-8 text-white sm:flex-row sm:items-center sm:p-12"
          >
            <div className="grid-pattern absolute inset-0" aria-hidden />
            <div className="relative">
              <Eyebrow light>Promotion exceptionnelle</Eyebrow>
              <p className="mt-2 font-serif text-3xl sm:text-4xl">ÉLAN 2026</p>
              <p className="mt-2 text-white/70">Profitez de l&apos;offre en cours sur nos formules d&apos;entraînement.</p>
            </div>
            <span className="relative rounded-full bg-cyan-accent px-6 py-3 text-sm font-semibold text-navy-950 transition group-hover:bg-white">
              Voir l&apos;offre →
            </span>
          </a>

          <div className="mt-16 flex flex-col items-center gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Partenaires</p>
            <div className="flex flex-wrap items-center justify-center gap-10">
              <a href={LINKS.olibris} target="_blank" rel="noopener noreferrer" className="opacity-80 transition hover:opacity-100">
                <Image src="/images/anim-olibris.gif" alt="Éditions Olibris" width={132} height={65} unoptimized />
              </a>
              <a href={LINKS.liguGuadeloupe} target="_blank" rel="noopener noreferrer" className="opacity-80 transition hover:opacity-100">
                <Image src="/images/Guadelupe.jpg" alt="Ligue d'échecs de Guadeloupe" width={315} height={66} />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
