import type { Metadata } from "next";
import Link from "next/link";
import { Button, Check, Container, PageHero } from "@/components/ui";
import { LINKS, PLATFORM_URL, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Espace étudiant",
  description: "Accédez à votre espace étudiant : suivi de progression, envoi des exercices et corrections personnalisées.",
};

export default function EspaceEtudiantPage() {
  const loginUrl = PLATFORM_URL || LINKS.legacyLogin;
  return (
    <>
      <PageHero
        eyebrow="Espace étudiant"
        title="Votre espace d'entraînement"
        intro="Réservé aux étudiants de l'Institut : suivi personnalisé, statistiques de progression, envoi de vos exercices et corrections du GMI Darko Anic."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={loginUrl}>Se connecter</Button>
          <Button href="/inscription" variant="secondary">
            Devenir étudiant
          </Button>
        </div>
      </PageHero>

      <section className="py-20">
        <Container className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-8">
            <h2 className="font-serif text-2xl text-navy-900">Je suis déjà étudiant</h2>
            <ul className="mt-5 space-y-3 text-ink">
              {[
                "Des informations personnalisées sur votre entraînement",
                "Des statistiques sur votre progression",
                "L'envoi direct des réponses à vos exercices",
                "Les corrections personnalisées du GMI Darko Anic, avec calcul de vos performances",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 text-brand-700" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 text-sm [&>*]:py-2.5">
              <Link href="/faq" className="block font-semibold text-brand-700 hover:underline">
                Comment recevoir mon kit de connexion ?
              </Link>
              <a href={mailto("Identifiants Espace étudiant perdus")} className="block font-semibold text-brand-700 hover:underline">
                J&apos;ai perdu mes identifiants
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-navy-900 p-8 text-white">
            <h2 className="font-serif text-2xl">Je ne suis pas encore étudiant</h2>
            <p className="mt-3 text-white/75">« Planifiez votre apprentissage et gérez votre progression. »</p>
            <div className="mt-6 flex flex-col text-sm [&>*]:py-2.5">
              <Link href="/cours-a-distance" className="font-semibold text-cyan-accent hover:underline">
                Quelles sont vos solutions d&apos;entraînement ? →
              </Link>
              <Link href="/guide" className="font-semibold text-cyan-accent hover:underline">
                Quel module choisir ? →
              </Link>
              <Link href="/inscription" className="font-semibold text-cyan-accent hover:underline">
                Comment s&apos;inscrire ? →
              </Link>
            </div>
            <div className="mt-8 rounded-2xl border border-cyan-accent/30 bg-cyan-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-accent">Bientôt</p>
              <p className="mt-2 text-sm text-white/85">
                Une nouvelle plateforme de cours arrive : échiquier partagé avec votre entraîneur, exercices interactifs
                et suivi de progression en temps réel.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
