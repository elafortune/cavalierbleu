import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Conditions d'inscription et de fonctionnement",
  description: "Inscription, conditions d'admission, réinscription et paiement à l'Institut Le Cavalier Bleu.",
};

const sections: { title: string; articles: [string, string][] }[] = [
  {
    title: "1 — Membre étudiant de l'Institut",
    articles: [
      ["Article 1", "La qualité de « Membre étudiant » s'obtient dès que l'inscription à l'Institut Le Cavalier Bleu est validée (validation à réception du règlement total des études)."],
      ["Article 2", "L'adhésion permet au membre étudiant de consulter l'ensemble des exercices correspondant à son module et d'utiliser l'espace réservé aux membres étudiants."],
      ["Article 3", "Des remises sur les autres activités de l'Institut sont réservées aux membres étudiants."],
      ["Article 4", "Lors de son inscription, le membre étudiant se voit attribuer un identifiant et un mot de passe, confiés exclusivement à l'étudiant et qui ne doivent en aucun cas être transmis à des tiers. L'étudiant est responsable de toute utilisation non conforme de ces éléments."],
      ["Article 5", "Tout module acheté donne à son bénéficiaire un droit d'utilisation individuelle pendant une durée de 12 mois."],
      ["Article 6", "Tous les cours, exercices et articles proposés sont la propriété intellectuelle de Darko Anic et/ou de ses partenaires. Aucun membre étudiant ne peut les utiliser à des fins commerciales sans accord préalable avec l'Institut Le Cavalier Bleu."],
      ["Article 7", "En cas de non-respect de ces dispositions, l'Institut se réserve le droit de supprimer l'accès de l'étudiant."],
    ],
  },
  {
    title: "2 — Admission et orientation dans un module",
    articles: [
      ["Article 8", "L'étudiant est inscrit dans un module du cycle d'étude correspondant à son classement Elo actuel, ou à son estimation (sauf dérogation)."],
      ["Article 9", "Si l'étudiant est débutant ou ne connaît pas précisément son niveau, des tests d'orientation lui sont envoyés. Il est ensuite orienté vers le module qui lui convient le mieux, selon les critères retenus par son entraîneur."],
      ["Article 10", "Les études démarrent dès validation de l'inscription, après réception du montant total. L'étudiant reçoit alors la totalité des cours et exercices de son module."],
      ["Article 11", "Le rythme recommandé est de 2 dossiers par mois."],
      ["Article 12", "Chaque dossier contient des fiches de cours et d'exercices, sauf les dossiers de contrôle des connaissances et l'examen final, qui ne contiennent que des exercices."],
      ["Article 13", "Un contrôle des connaissances est programmé en milieu de module."],
      ["Article 14", "Un examen final est prévu à la fin de chaque module."],
      ["Article 15", "Les certificats délivrés par l'Institut Le Cavalier Bleu sont strictement privés et attestent que le titulaire a terminé avec succès son module."],
      ["Article 16", "Le certificat de fin de module est délivré à l'étudiant ayant intégralement suivi son module avec un taux de réussite supérieur à 60 %."],
    ],
  },
  {
    title: "3 — Réinscription",
    articles: [["Article 17", "La réinscription dans un autre module est conditionnée par la réussite à l'examen final du module précédent."]],
  },
  {
    title: "4 — Paiement",
    articles: [["Article 18", "Avant le début des études, le règlement total doit être effectué en ligne sur la page Inscription (paiement sécurisé par carte) ou par virement bancaire (RIB sur simple demande)."]],
  },
];

export default function ConditionsPage() {
  return (
    <>
      <PageHero eyebrow="Conditions" title="Inscription et fonctionnement de l'Institut" intro="Enseignement du jeu d'échecs à distance." />
      <section className="py-20">
        <Container className="max-w-3xl">
          <div className="rounded-3xl bg-cream-200 p-7 leading-relaxed text-ink">
            <h2 className="font-serif text-2xl text-navy-900">Inscription en ligne</h2>
            <p className="mt-3">
              Une fois votre commande validée et réglée, votre inscription est transmise à l&apos;Institut. Vous recevez
              une confirmation par e-mail accompagnée de votre module au format PDF, puis un second e-mail contenant vos
              codes d&apos;accès à l&apos;Espace étudiant. En cas de doute sur le module adapté, demandez un test
              d&apos;orientation.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title} className="mt-12">
              <h2 className="font-serif text-2xl text-navy-900">{s.title}</h2>
              <dl className="mt-5 space-y-4">
                {s.articles.map(([n, t]) => (
                  <div key={n} className="grid grid-cols-1 gap-1 sm:grid-cols-[110px_1fr]">
                    <dt className="font-semibold text-brand-700">{n}</dt>
                    <dd className="leading-relaxed text-ink">{t}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="mt-16 rounded-3xl border border-navy-900/10 bg-white p-7">
            <h2 className="font-serif text-2xl text-navy-900">Étudiez avec efficacité</h2>
            <div className="mt-4 space-y-3 leading-relaxed text-muted">
              <p>
                Dès votre module choisi, vous recevez la totalité des cours et exercices en PDF, ainsi que vos codes
                d&apos;accès valables 12 mois pour envoyer vos solutions depuis l&apos;Espace étudiant.
              </p>
              <p>
                Étudiez dossier par dossier, en suivant la chronologie du module, idéalement au rythme de 2 dossiers par
                mois. Lorsque vous avez terminé un dossier, signalez-le dans votre Espace étudiant : vos corrigés et votre
                suivi individuel vous parviennent par e-mail dans les jours qui suivent.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
