import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/FinalCta";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Inscription, espace étudiant, choix du module, formation : les réponses à vos questions sur l'Institut Le Cavalier Bleu.",
};

type QA = { q: string; a: React.ReactNode };

const groups: { title: string; items: QA[] }[] = [
  {
    title: "Je ne suis pas encore étudiant",
    items: [
      {
        q: "Que va m'apporter l'étude dans un module ?",
        a: "Les modules s'adressent à tous ceux qui veulent équilibrer leurs connaissances — en comblant les trous de leur apprentissage précédent — et assurer une progression régulière, basée sur un travail suivi par leur entraîneur personnel. Ils apportent des connaissances systématisées en technique de jeu, finales, tactique, stratégie et compréhension des ouvertures.",
      },
      {
        q: "Comment définir mon module d'orientation ?",
        a: (
          <>
            Totalement débutant : c&apos;est le Module Jaune directement. Vous savez un peu jouer : vous recevrez un
            test d&apos;orientation du cycle Apprentissage. Vous avez un classement Elo mais ne connaissez pas
            précisément votre niveau : vous recevrez des tests d&apos;orientation. Essayez aussi{" "}
            <Link href="/guide" className="font-semibold text-brand-700 hover:underline">
              notre guide interactif
            </Link>
            .
          </>
        ),
      },
      {
        q: "Comment m'inscrire ?",
        a: (
          <>
            Directement en ligne sur la{" "}
            <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
              page d&apos;inscription
            </Link>{" "}
            (paiement sécurisé par carte), ou par virement bancaire (RIB sur simple demande). Dès l&apos;enregistrement de
            votre paiement, vous recevez votre module et vos codes d&apos;accès à l&apos;Espace étudiant.
          </>
        ),
      },
      {
        q: "À quelle date puis-je démarrer ?",
        a: "Dès que votre inscription est enregistrée. Vous pouvez donc démarrer à n'importe quelle période de l'année, à la date de votre choix.",
      },
      {
        q: "Que peut m'apporter la formation à la carte ?",
        a: "Elle s'adresse aux joueurs de tous niveaux qui souhaitent approfondir un sujet précis, et aux compétiteurs qui veulent améliorer un aspect particulier de leur jeu. C'est une aide ponctuelle précieuse, un indicateur de vos connaissances et de votre progression, avec des conseils pour réorienter votre perfectionnement.",
      },
      {
        q: "Module ou formation à la carte : que choisir ?",
        a: "Cela dépend de votre niveau actuel et de vos objectifs personnels ou professionnels. Consultez les programmes des modules : avez-vous intégré ces connaissances ? Travaillés avec sérieux, les deux vous apporteront de grandes connaissances techniques. En cas de doute, contactez-nous.",
      },
      {
        q: "Que m'apporte l'Espace étudiant ?",
        a: "Des informations personnalisées sur votre entraînement et des statistiques de progression, la possibilité d'envoyer directement vos réponses aux exercices, puis les corrections personnalisées du GMI Darko Anic sous 3 à 4 jours avec un calcul de vos performances.",
      },
    ],
  },
  {
    title: "Je suis déjà étudiant",
    items: [
      {
        q: "Je suis déjà étudiant : comment obtenir mon kit de connexion à l'Espace étudiant ?",
        a: "Envoyez-nous un e-mail avec vos références complètes : nom, prénom, adresse, téléphone, numéro d'adhérent et date d'inscription dans votre module. Vous recevrez votre code de connexion sous 72 heures. Aucune information de connexion n'est donnée par téléphone.",
      },
      {
        q: "J'ai perdu mes identifiants, comment faire ?",
        a: "L'accès étant sécurisé, envoyez-nous un e-mail avec vos références complètes (nom, prénom, adresse, téléphone, numéro d'adhérent, date d'inscription). Vous recevrez vos codes par e-mail sous 72 heures. Rappel : ces informations sont confidentielles et ne doivent pas être transmises à des tiers.",
      },
    ],
  },
  {
    title: "Formation et enseignement",
    items: [
      {
        q: "Quels sont les apports de la formation professionnelle ?",
        a: "Elle s'adresse à vous si vous envisagez de vous orienter professionnellement ou d'élargir vos activités : amélioration de vos performances en compétition et acquisition de nouvelles connaissances pédagogiques et techniques.",
      },
      {
        q: "Je crée un club : puis-je utiliser les fiches pédagogiques pour mes cours ?",
        a: (
          <>
            Oui, c&apos;est leur raison d&apos;être. Les{" "}
            <Link href="/pedagogie" className="font-semibold text-brand-700 hover:underline">
              fiches pédagogiques
            </Link>{" "}
            proposent un programme progressif, technique et pédagogique, avec des exercices choisis. Déclinées en 2
            niveaux, elles permettent d&apos;enseigner 2 ans d&apos;échecs à des adultes comme à des enfants.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Questions fréquentes" intro="Vous ne trouvez pas votre réponse ? Écrivez-nous, nous répondons personnellement." />
      <section className="py-20">
        <Container className="max-w-4xl space-y-14">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="font-serif text-2xl text-navy-900">{g.title}</h2>
              <div className="mt-6 divide-y divide-navy-900/10 rounded-3xl border border-navy-900/10 bg-white">
                {g.items.map((item) => (
                  <details key={item.q} className="group px-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-navy-900">
                      {item.q}
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-700 transition group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <div className="-mt-1 pb-5 leading-relaxed text-muted">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
