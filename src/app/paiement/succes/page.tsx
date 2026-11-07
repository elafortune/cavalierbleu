import type { Metadata } from "next";
import { Button, Container } from "@/components/ui";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = { title: "Paiement confirmé", robots: { index: false } };

export default function SuccessPage() {
  return (
    <section className="bg-hero relative overflow-hidden py-28 text-white">
      <div className="grid-pattern absolute inset-0" aria-hidden />
      <Container className="relative max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-accent text-3xl text-navy-950">✓</div>
        <h1 className="mt-8 font-serif text-4xl sm:text-5xl">Merci pour votre inscription !</h1>
        <p className="mt-5 text-lg text-white/75">
          Votre paiement est confirmé. Vous allez recevoir un reçu par e-mail. L&apos;Institut vous contacte très
          rapidement pour la suite : envoi de votre module, planification de vos cours ou expédition de vos fiches.
        </p>
        <p className="mt-4 text-white/60">
          Une question ? {CONTACT.email} · {CONTACT.phoneFr}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button href="/">Retour à l&apos;accueil</Button>
          <Button href="/articles" variant="secondary">
            Lire nos articles
          </Button>
        </div>
      </Container>
    </section>
  );
}
