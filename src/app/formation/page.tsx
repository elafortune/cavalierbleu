import type { Metadata } from "next";
import Image from "next/image";
import { FinalCta } from "@/components/FinalCta";
import { Placeholder } from "@/components/Placeholder";
import { Button, Check, Container, PageHero, SectionTitle } from "@/components/ui";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Formation professionnelle diplômante FFE",
  description:
    "Formations DIFFE, DAFFE et DEFFE agréées par la Fédération Française des Échecs, animées par le GMI Darko Anic, Maître-Entraîneur FFE.",
};

const diplomas = [
  {
    code: "DIFFE",
    name: "Diplôme d'Initiateur",
    family: "Formation d'animateur",
    duration: "16 heures, examen oral et écrit compris",
    fee: "50 € à 80 €",
    pdf: "https://www.echecs.asso.fr/Actus/2873/DIFFE_2021.pdf",
  },
  {
    code: "DAFFE 1",
    name: "Diplôme d'Animateur",
    family: "Formation d'animateur",
    duration: "32 heures, examen oral et écrit et stage pratique de 10 heures compris",
    fee: "100 € à 150 €",
    pdf: "https://www.echecs.asso.fr/Actus/2873/DAFFE1_2021.pdf",
  },
  {
    code: "DAFFE 2",
    name: "Diplôme d'Éducateur",
    family: "Formation d'animateur",
    duration: "35 heures, examen oral et écrit compris (ou 4 jours d'affilée)",
    fee: "200 € à 300 €",
    pdf: "https://www.echecs.asso.fr/Reglements/Reglements2015/4%206%20DAFFE%202e%20degre.pdf",
  },
  {
    code: "DEFFE 1",
    name: "Diplôme d'Entraîneur",
    family: "Formation d'entraîneur",
    duration: "35 heures, examens compris, + 20 heures de stage (10 h collectif, 10 h individuel)",
    fee: "150 € à 200 €",
    pdf: "https://www.echecs.asso.fr/Actus/2873/DEFFE1_2021.pdf",
  },
];

export default function FormationPage() {
  return (
    <>
      <PageHero
        eyebrow="Formation professionnelle"
        title={
          <>
            Formez les animateurs et entraîneurs <span className="italic text-cyan-accent">de votre club</span>
          </>
        }
        intro="Stages diplômants agréés par la Fédération Française des Échecs, animés par le GMI Darko Anic, Maître-Entraîneur et formateur des entraîneurs de la FFE."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={mailto("Organiser une formation FFE")}>Organiser une formation</Button>
          <Button href={LINKS.ffeStages} variant="secondary">
            Calendrier des formations fédérales
          </Button>
        </div>
      </PageHero>

      <section className="py-20 lg:py-28">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionTitle
              eyebrow="Pour les clubs"
              title="Nous prenons en charge l'organisation"
              intro="De nombreux clubs ont besoin de former leurs enseignants et entraîneurs. Nous proposons aux clubs intéressés de les accompagner de A à Z."
            />
            <ul className="mt-8 space-y-3">
              {[
                "Promotion de la formation",
                "Recherche des candidats",
                "Montage financier",
                "Le formateur : GMI Darko Anic, Maître-Entraîneur de la FFE",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-ink">
                  <Check className="mt-0.5 text-brand-700" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl bg-cream-200 p-6 text-sm leading-relaxed text-ink">
              <p>
                Les clubs possédant le <strong>label Formateur de la FFE</strong> peuvent organiser ces stages. Les
                autres clubs passent par leur ligue ou leur comité départemental, tous deux habilités.
              </p>
              <p className="mt-3">
                <strong>Important :</strong> possibilité de prise en charge par un organisme collecteur.
                Contactez-nous pour tout complément d&apos;information.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-5 rounded-3xl border border-navy-900/10 bg-white p-6">
              <Image src="/images/image001.jpg" alt="Label Formateur de la Fédération Française des Échecs" width={144} height={112} className="rounded-lg" />
              <p className="text-sm text-muted">Stages agréés par la Fédération Française des Échecs (FFE).</p>
            </div>
            <Placeholder label="Photo d'une session de formation" className="aspect-[4/3]" />
          </div>
        </Container>
      </section>

      <section className="bg-navy-900 py-20 text-white lg:py-28">
        <Container>
          <SectionTitle light eyebrow="Stages agréés FFE" title="Les diplômes fédéraux" intro="Droits d'inscription : prix conseillés par la FFE." />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {diplomas.map((d) => (
              <article key={d.code} className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-accent">{d.family}</p>
                <h3 className="mt-2 font-serif text-2xl">
                  {d.code} <span className="text-white/60">— {d.name}</span>
                </h3>
                <dl className="mt-5 flex-1 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 flex-none text-white/50">Durée</dt>
                    <dd className="text-white/85">{d.duration}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 flex-none text-white/50">Inscription</dt>
                    <dd className="text-white/85">{d.fee}</dd>
                  </div>
                </dl>
                <a href={d.pdf} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan-accent hover:underline">
                  Programme officiel (PDF FFE) →
                </a>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-white/60">
            Pour plus de détails, consultez le site de la FFE :{" "}
            <a href={LINKS.ffeFormation} target="_blank" rel="noopener noreferrer" className="text-cyan-accent hover:underline">
              Formation
            </a>
            .
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionTitle
            eyebrow="Prochaines sessions"
            title="Calendrier et dossiers d'inscription"
            intro="Le calendrier des prochaines sessions et les dossiers d'inscription seront publiés ici prochainement. En attendant, contactez-nous pour connaître les dates."
          />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Placeholder label="Calendrier des sessions" className="aspect-[4/3]" />
            <Placeholder label="Dossier d'inscription (PDF)" className="aspect-[4/3]" />
            <Placeholder label="Grille des interventions (PDF)" className="aspect-[4/3]" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={mailto("Formation : animateur")} variant="dark">
              Formation animateur
            </Button>
            <Button href={mailto("Formation : éducateur")} variant="ghost">
              Formation éducateur
            </Button>
            <Button href={mailto("Formation : entraîneur")} variant="ghost">
              Formation entraîneur
            </Button>
            <Button href={mailto("Formation continue")} variant="ghost">
              Formation continue (devis)
            </Button>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
