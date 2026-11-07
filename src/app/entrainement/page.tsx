import type { Metadata } from "next";
import Image from "next/image";
import { BuyButton } from "@/components/BuyButton";
import { FinalCta } from "@/components/FinalCta";
import { Testimonials } from "@/components/Testimonials";
import { Button, Check, Container, Eyebrow, PageHero, SectionTitle } from "@/components/ui";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entraînement individuel et collectif",
  description:
    "Cours d'échecs individuels à distance, stages intensifs, séminaires et coaching de compétition avec le GMI Darko Anic.",
};

const packs = [
  { id: "cours-1h", name: "Séance unique", hours: "1 heure", price: "60 €", unit: "60 € / h" },
  { id: "cours-10h", name: "Forfait 10 heures", hours: "10 heures", price: "490 €", unit: "49 € / h", featured: true },
  { id: "cours-20h", name: "Forfait 20 heures", hours: "20 heures", price: "890 €", unit: "44,50 € / h" },
];

const stageAreas = [
  "Préparation de la théorie des ouvertures",
  "Étude de la stratégie",
  "Entraînement tactique et calcul",
  "Entraînement aux finales",
  "Perfectionnement de la technique",
  "Préparation spécifique aux compétitions",
  "Préparation psychologique",
];

const seminars = [
  {
    title: "Les bons critères pour entrer en finale",
    text: "Savoir quand passer du milieu de jeu à la finale : une méthodologie pour identifier les bons critères d'évaluation, et sa mise en pratique.",
  },
  {
    title: "Recherche des motifs tactiques",
    text: "Comprendre les mécanismes tactiques, reconnaître les « patterns » et construire un entraînement efficace — avec atelier pratique.",
  },
  {
    title: "Optimiser son entraînement avec ChessBase ou Fritz",
    text: "Gérer ses bases de données, mener ses recherches et utiliser pleinement les logiciels. Ordinateur portable conseillé.",
  },
  {
    title: "Méthodes d'attaque et choix des systèmes d'ouverture",
    text: "Étudier les schémas d'attaque et composer un répertoire plus engagé, qui colle à votre personnalité.",
  },
];

export default function EntrainementPage() {
  return (
    <>
      <PageHero
        eyebrow="Entraînement individuel & collectif"
        title={
          <>
            Un entraîneur Grand-Maître, <span className="italic text-cyan-accent">rien que pour vous</span>
          </>
        }
        intro="Cours particuliers en direct, stages intensifs, séminaires mensuels et coaching de compétition : choisissez le format qui correspond à vos ambitions."
      >
        <nav className="mt-10 flex flex-wrap gap-2 text-sm" aria-label="Sections de la page">
          {[
            ["#individuel", "Cours individuel"],
            ["#stage", "Stage intensif"],
            ["#seminaires", "Séminaires"],
            ["#coaching", "Coaching"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-white/20 px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </PageHero>

      {/* COURS INDIVIDUEL */}
      <section id="individuel" className="scroll-mt-24 py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <SectionTitle
                eyebrow="Individuel"
                title="Cours individuel à distance"
                intro="Les cours s'adressent à tout joueur de club, quel que soit son niveau. L'enseignement est personnalisé et tient compte des spécificités et besoins de chacun."
              />
              <div className="mt-10 space-y-8">
                <div>
                  <h3 className="font-serif text-xl text-navy-900">Quels bénéfices en retirer ?</h3>
                  <p className="mt-2 leading-relaxed text-muted">
                    Pour marquer une progression, il est indispensable d&apos;harmoniser vos connaissances. C&apos;est
                    précisément dans ce domaine qu&apos;un entraîneur expérimenté vous sera le plus utile : il repère
                    les lacunes dans votre compréhension du jeu — techniques, tactiques, stratégiques — puis vous
                    donne les méthodes et outils pour structurer votre analyse.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-navy-900">Comment ça se passe ?</h3>
                  <ol className="mt-4 space-y-4">
                    {[
                      ["Premier échange", "Un entretien pour faire le point sur votre niveau et vos objectifs."],
                      ["Cours en direct", "Depuis chez vous, par internet ou par téléphone, sans surcoût."],
                      ["Progression suivie", "Votre entraîneur ajuste le programme séance après séance."],
                    ].map(([t, d], i) => (
                      <li key={t} className="flex gap-4">
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-navy-900">{t}</p>
                          <p className="text-muted">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="lg:pt-10">
              <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted">Tarifs</p>
                <div className="mt-5 space-y-3">
                  {packs.map((p) => (
                    <div
                      key={p.name}
                      className={`rounded-2xl border p-5 ${
                        p.featured ? "border-brand-700 bg-brand-100/60" : "border-navy-900/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy-900">
                          {p.name}
                          {p.featured && (
                            <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">
                              Populaire
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted">{p.unit}</p>
                      </div>
                        <p className="whitespace-nowrap font-serif text-2xl text-navy-900">{p.price}</p>
                      </div>
                      <BuyButton productId={p.id} label={`Payer ${p.price}`} variant={p.featured ? "dark" : "outline"} className="mt-4" />
                    </div>
                  ))}
                </div>
                <Button href="/contact" variant="ghost" className="mt-6 w-full">
                  Une question avant de vous lancer ? Contactez-nous
                </Button>
                <p className="mt-4 text-center text-xs text-muted">Paiement sécurisé par carte · facture par e-mail</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* STAGE */}
      <section id="stage" className="scroll-mt-24 bg-navy-900 py-20 text-white lg:py-28">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <SectionTitle
              light
              eyebrow="Compétiteurs"
              title="Stage d'entraînement individuel"
              intro="Ce stage intensif a pour objectif d'améliorer les performances des joueurs de compétition. Un programme d'entraînement est proposé à l'issue d'un entretien et d'un bilan qui révèlent vos besoins prioritaires."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={mailto("Devis entraînement individuel")}>Demander un devis</Button>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stageAreas.map((a) => (
              <li key={a} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
                <Check className="mt-0.5 text-cyan-accent" />
                {a}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* SEMINAIRES */}
      <section id="seminaires" className="scroll-mt-24 py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <SectionTitle
              eyebrow="Collectif"
              title="Séminaires"
              intro="Nous organisons des séminaires toute l'année, à raison d'une session par mois, principalement à Montpellier. Les clubs peuvent aussi commander un séminaire sur mesure : thème, durée, dates et lieu."
            />
            <Image
              src="/images/seminaire.jpg"
              alt="Participants à un séminaire d'échecs de l'Institut Le Cavalier Bleu"
              width={200}
              height={150}
              className="w-full max-w-sm rounded-2xl object-cover shadow-lg lg:ml-auto"
            />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {seminars.map((s) => (
              <article key={s.title} className="rounded-2xl border border-navy-900/10 bg-white p-7">
                <h3 className="font-serif text-xl text-navy-900">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 rounded-2xl bg-cream-200 p-7 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">Horaires</p>
              <p className="mt-1 text-sm text-muted">
                Samedi 10h–12h30 et 14h–16h30
                <br />
                Dimanche 9h30–12h30 et 14h–16h
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">Adultes</p>
              <p className="mt-1 font-serif text-2xl text-navy-900">160 €</p>
              <p className="text-xs text-muted">185 € pour le séminaire à Paris</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">Jeunes</p>
              <p className="mt-1 font-serif text-2xl text-navy-900">120 €</p>
              <p className="text-xs text-muted">155 € pour le séminaire à Paris</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={mailto("Séminaire")} variant="dark">
              S&apos;inscrire à un séminaire
            </Button>
            <Button href={mailto("Séminaire sur mesure pour club")} variant="ghost">
              Séminaire pour mon club
            </Button>
          </div>
        </Container>
      </section>

      {/* COACHING */}
      <section id="coaching" className="scroll-mt-24 bg-hero relative overflow-hidden py-20 text-white lg:py-28">
        <div className="grid-pattern absolute inset-0" aria-hidden />
        <Container className="relative grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Eyebrow light>Coaching</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Atteignez vos objectifs de compétition, plus vite
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/80">
              <p>
                Le coaching est un <strong className="text-white">accompagnement personnalisé</strong> des
                individus — ou des groupes — motivés, souhaitant atteindre des objectifs dans un temps donné.
              </p>
              <p>
                Au fil des séances, toutes les questions importantes concernant l&apos;optimisation de votre parcours
                en compétition sont abordées et traitées, pour accomplir vos{" "}
                <strong className="text-white">objectifs fixés à l&apos;avance</strong>.
              </p>
              <p>
                Grâce à une <strong className="text-white">préparation mentale</strong> qui renforce la confiance en
                soi et la détermination, la performance en compétition se stabilise, puis s&apos;améliore de manière
                significative.
              </p>
            </div>
          </div>
          <div className="self-center rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/images/darko-portrait.jpg"
                alt="Le GMI Darko Anic, spécialiste de la préparation mentale"
                width={200}
                height={200}
                className="h-20 w-20 rounded-full object-cover object-[50%_70%] ring-2 ring-cyan-accent/60"
              />
              <p className="text-sm text-white/70">
                GMI Darko Anic
                <br />
                <span className="text-white/50">Maîtrise de psychologie · Maître-Entraîneur FFE</span>
              </p>
            </div>
            <p className="font-serif text-2xl">Vous aussi, vous êtes tenté ?</p>
            <p className="mt-3 text-white/75">
              Demandez un entretien avec le <strong className="text-white">GMI Darko ANIC</strong> pour faire le point
              sur vos ambitions.
            </p>
            <Button href={mailto("Coaching")} className="mt-6 w-full">
              Demander un entretien
            </Button>
            <p className="mt-4 text-center text-sm text-white/50">desk@cavalierbleu.com</p>
          </div>
        </Container>
      </section>

      <Testimonials limit={3} />

      {/* LIVRE */}
      <section className="py-16">
        <Container className="flex flex-col items-center gap-8 rounded-3xl border border-navy-900/10 bg-white p-8 sm:flex-row sm:p-10">
          <a href={LINKS.bookFiche50} target="_blank" rel="noopener noreferrer" className="flex-none">
            <Image
              src="/images/book1.jpg"
              alt="Couverture du livre Psychologie du joueur d'échecs"
              width={120}
              height={150}
              className="rounded shadow-lg"
            />
          </a>
          <div className="flex-1">
            <Eyebrow>Pour aller plus loin</Eyebrow>
            <p className="mt-2 font-serif text-2xl text-navy-900">Psychologie du joueur d&apos;échecs — Science et performance</p>
            <p className="mt-2 text-muted">Philippe Chassy &amp; Darko Anic, éditions Olibris.</p>
          </div>
          <Button href={LINKS.bookFiche50} variant="ghost">
            Voir le livre
          </Button>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
