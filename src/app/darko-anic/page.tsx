import type { Metadata } from "next";
import Image from "next/image";
import { FinalCta } from "@/components/FinalCta";
import { Button, Container, PageHero, SectionTitle } from "@/components/ui";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Darko Anic, Grand-Maître International",
  description:
    "Parcours et palmarès du GMI Darko Anic : Champion de Croatie, Vice-Champion de France, Maître-Entraîneur FFE, fondateur de l'Institut Le Cavalier Bleu.",
};

const titles = [
  { label: "Grand-Maître International", detail: "depuis 1999" },
  { label: "Maître-Entraîneur FFE", detail: "formateur des entraîneurs de la Fédération" },
  { label: "Directeur de l'Institut", detail: "responsable de l'Enseignement et de la Formation" },
  { label: "Maîtrise en sciences sociales", detail: "psychologie, pédagogie, sociologie — Université de Zagreb" },
];

const palmares = [
  ["1974", "Champion de Zadar"],
  ["1976", "Champion Universitaire de Zagreb"],
  ["1979", "Champion de Dalmatie"],
  ["1985", "Champion de Croatie"],
  ["1997", "Vice-Champion de France"],
  ["1999", "Grand-Maître International"],
];

const timeline = [
  ["1957", "Naissance à Zadar, en Croatie, le 30 avril."],
  ["1971", "Fasciné par les commentaires du MI Braslav Rabar sur l'ascension de Robert Fischer, il apprend à jouer à 14 ans et s'inscrit au club local."],
  ["1974", "Autodidacte, il progresse vite : trois ans plus tard, il est Champion de Zadar. Il entraîne dès l'âge de 17 ans."],
  ["1976", "Études de psychologie, pédagogie et sociologie à l'Université de Zagreb. Il enseigne les échecs dans les écoles primaires et devient Champion Universitaire."],
  ["1979 – 1985", "Champion de Dalmatie (1979) puis Champion de Croatie (1985)."],
  ["1987", "Rencontre sa future épouse à l'Open de Cannes et s'installe en France."],
  ["1989", "Devient Maître International."],
  ["1992", "La FFE lui confie les stages « Cadets-Juniors » du sud de la France et l'accompagnement de l'équipe de France Jeunes."],
  ["1995", "Le 26 septembre, soutenu par son épouse Monique, il fonde l'Institut Le Cavalier Bleu, première véritable école d'échecs à distance francophone avec suivi individuel."],
  ["1997", "Vice-Champion de France. Capitaine de l'Équipe de France à la Mitropa Cup (Montecatini Terme 1997, Pula 2003)."],
  ["1999", "Obtient le titre très convoité de Grand-Maître International."],
  ["2000 – 2005", "Membre du Comité Directeur de la FFE, représentant des joueurs de haut niveau."],
  ["2004", "Sélectionneur et capitaine de l'Équipe de France masculine aux Olympiades de Calvià."],
  ["1999 – 2008", "Entraîneur des Jeunes aux Championnats du Monde (Oropesa del Mar, Héraklion, Belfort) et d'Europe (Herceg Novi, Šibenik)."],
];

export default function DarkoPage() {
  return (
    <>
      <PageHero
        eyebrow="Votre entraîneur"
        title={
          <>
            Darko Anic, <span className="italic text-cyan-accent">Grand-Maître International</span>
          </>
        }
        intro="Joueur de compétition, pédagogue diplômé et formateur des entraîneurs de la Fédération Française des Échecs : un parcours rare au service de votre progression."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={mailto("Demande d'entretien")}>Échanger avec Darko</Button>
          <Button href="/entrainement" variant="secondary">
            Voir les formules
          </Button>
        </div>
      </PageHero>

      <section className="py-20 lg:py-28">
        <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-navy-900/10 bg-white p-3">
              <Image
                src="/images/darko-echiquier.jpg"
                alt="Darko Anic devant un échiquier"
                width={260}
                height={180}
                className="aspect-[13/9] w-full rounded-2xl object-cover"
              />
            </div>
            <div className="flex items-center gap-5 rounded-3xl border border-navy-900/10 bg-white p-5">
              <Image
                src="/images/anicdarko.gif"
                alt="Darko Anic en tournoi"
                width={88}
                height={132}
                unoptimized
                className="rounded-lg"
              />
              <blockquote className="font-serif text-lg italic text-navy-900">
                « Dans chaque victoire se cache une future défaite… »
              </blockquote>
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="Son profil"
              title="Compétiteur, entraîneur, pédagogue"
              intro="Pilier de l'Institut depuis sa fondation, Darko allie enthousiasme et rigueur professionnelle. Il enseigne les échecs depuis l'âge de 17 ans, en Croatie comme en France."
            />
            <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {titles.map((t) => (
                <div key={t.label} className="rounded-2xl border border-navy-900/10 bg-white p-5">
                  <dt className="font-semibold text-navy-900">{t.label}</dt>
                  <dd className="mt-1 text-sm text-muted">{t.detail}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-12 font-serif text-2xl text-navy-900">Palmarès</h3>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {palmares.map(([y, t]) => (
                <li key={t} className="rounded-2xl bg-navy-900 p-4 text-white">
                  <p className="font-serif text-2xl text-cyan-accent">{y}</p>
                  <p className="mt-1 text-sm text-white/80">{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-cream-200 py-20 lg:py-28">
        <Container>
          <SectionTitle eyebrow="Son parcours" title="De Zadar à l'Équipe de France" />
          <ol className="relative mt-12 max-w-3xl border-l-2 border-brand-200 pl-8">
            {timeline.map(([y, t]) => (
              <li key={y + t} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-cream-200 bg-brand-700" />
                <p className="font-display text-sm font-bold tracking-wider text-brand-700">{y}</p>
                <p className="mt-1 leading-relaxed text-ink">{t}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-navy-900 p-8 text-white sm:p-12 lg:grid-cols-[auto_1fr_auto]">
          <a href={LINKS.bookPsychologie} target="_blank" rel="noopener noreferrer">
            <Image src="/images/book1.jpg" alt="Psychologie du joueur d'échecs" width={120} height={150} className="rounded shadow-xl" />
          </a>
          <div>
            <p className="font-serif text-2xl">Auteur de « Psychologie du joueur d&apos;échecs »</p>
            <p className="mt-2 text-white/70">
              Co-écrit avec Philippe Chassy (docteur en psychologie, Hope University, Liverpool). Éditions Olibris,
              recommandé par la FFE.
            </p>
          </div>
          <Button href={LINKS.bookPsychologie}>Découvrir le livre</Button>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
