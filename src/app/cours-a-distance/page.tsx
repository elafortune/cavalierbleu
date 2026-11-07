import type { Metadata } from "next";
import Image from "next/image";
import { BuyButton } from "@/components/BuyButton";
import { FinalCta } from "@/components/FinalCta";
import { Testimonials } from "@/components/Testimonials";
import { Button, Check, Container, PageHero, SectionTitle } from "@/components/ui";
import { CYCLES, MODULES } from "@/content/modules";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enseignement à distance — Modules d'entraînement",
  description:
    "9 modules d'entraînement aux échecs en 3 cycles, du débutant à l'objectif Maître International, avec suivi personnalisé par le GMI Darko Anic.",
};

const infos = [
  {
    title: "Un système cohérent",
    text: "Les modules constituent un système cohérent et dynamique de cours et d'exercices conçus pour progresser à votre rythme. Chaque dossier compte environ 40 diagrammes : fiches de cours et exercices, plus des dossiers de contrôle et un examen final.",
  },
  {
    title: "Un suivi personnalisé",
    text: "Votre entraîneur mesure vos progrès, veille à ce que les compétences soient durablement acquises, analyse vos mécanismes de réflexion et les corrige au besoin. Un authentique entraînement visant à optimiser vos performances.",
  },
  {
    title: "Comment choisir son module ?",
    text: "Choisissez le module qui correspond au plus près de vos connaissances actuelles. En cas de doute, inscrivez-vous dans le cycle correspondant à votre niveau et demandez un test d'orientation.",
  },
  {
    title: "Comment réussir ?",
    text: "Curiosité, plaisir, passion… et un travail assidu ! Le rythme recommandé est de 2 dossiers par mois. Et à la moindre difficulté, votre entraîneur vous apporte tout le soutien nécessaire.",
  },
];

export default function CoursADistancePage() {
  return (
    <>
      <PageHero
        eyebrow="Enseignement à distance · depuis 1995"
        title={
          <>
            Les modules d&apos;entraînement : <span className="italic text-cyan-accent">cours, exercices et suivi personnalisé</span>
          </>
        }
        intro="L'Institut Le Cavalier Bleu est le premier centre français d'enseignement des échecs à distance assurant un véritable suivi personnalisé. Sa longévité tient à la rigueur de son enseignement et à la fidélité de son public."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={LINKS.guide}>Trouver mon module en 1 minute</Button>
          <Button href="#modules" variant="secondary">
            Voir les 9 modules
          </Button>
        </div>
        <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
          {[
            ["3", "cycles d'étude"],
            ["9", "modules"],
            ["5 000+", "exercices"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd className="font-serif text-3xl text-cyan-accent">{v}</dd>
              <dd className="text-sm text-white/60">{l}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="py-20">
        <Container className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {infos.map((i) => (
            <div key={i.title} className="rounded-3xl border border-navy-900/10 bg-white p-6">
              <h2 className="font-serif text-xl text-navy-900">{i.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{i.text}</p>
            </div>
          ))}
        </Container>
      </section>

      <section id="modules" className="scroll-mt-24 pb-20 lg:pb-28">
        <Container>
          {CYCLES.map((cycle, ci) => (
            <div key={cycle.name} className={ci ? "mt-20" : ""}>
              <SectionTitle eyebrow={`Cycle ${ci + 1}`} title={`Cycle « ${cycle.name} »`} intro={cycle.intro} />
              <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {MODULES.filter((m) => m.cycle === cycle.name).map((m) => (
                  <article
                    key={m.id}
                    id={m.id}
                    className="flex scroll-mt-28 flex-col rounded-3xl border border-navy-900/10 bg-white p-7 target:ring-4 target:ring-brand-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full ring-4 ring-black/5" style={{ backgroundColor: m.color }} aria-hidden />
                      <h3 className="font-serif text-2xl text-navy-900">{m.name}</h3>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-brand-700">
                      {m.level} · {m.dossiers}
                    </p>
                    <div className="mt-4 flex-1 space-y-3 text-sm leading-relaxed text-muted">
                      {m.description.map((d) => (
                        <p key={d.slice(0, 20)}>{d}</p>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-navy-900/10 pt-5">
                      <p className="font-serif text-2xl text-navy-900">{m.price}</p>
                      <div className="w-44">
                        {m.productId ? (
                          <BuyButton productId={m.productId} label="S'inscrire" />
                        ) : (
                          <Button href={mailto(m.name)} variant="ghost" className="w-full">
                            Nous consulter
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-navy-900 py-20 text-white">
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionTitle
              light
              eyebrow="Comment ça marche"
              title="De l'inscription au certificat"
            />
            <ol className="mt-8 space-y-4">
              {[
                "Vous choisissez votre module (ou passez un test d'orientation) et réglez en ligne.",
                "Vous recevez la totalité du module en PDF et vos codes d'accès à l'Espace étudiant (valables 12 mois).",
                "Vous étudiez à votre rythme — idéalement 2 dossiers par mois — et envoyez vos solutions.",
                "Vous recevez vos corrigés et votre suivi individuel par le GMI Darko Anic.",
                "Contrôle des connaissances à mi-parcours, examen final et certificat de fin de module (taux de réussite > 60 %).",
              ].map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cyan-accent font-semibold text-navy-950">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-white/85">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
            <Image src="/images/window.jpg" alt="" width={130} height={120} className="rounded-xl" />
            <p className="mt-6 font-serif text-2xl">Vous hésitez entre deux modules ?</p>
            <ul className="mt-4 space-y-2 text-white/80">
              {["Répondez au guide interactif", "Ou demandez un test d'orientation gratuit"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 text-cyan-accent" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={LINKS.guide}>Le guide</Button>
              <Button href={mailto("Test d'orientation")} variant="secondary">
                Test d&apos;orientation
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Testimonials limit={3} />
      <FinalCta />
    </>
  );
}
