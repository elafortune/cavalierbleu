import type { Metadata } from "next";
import { ModuleGuide } from "@/components/ModuleGuide";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Le guide : bien choisir son module",
  description: "Répondez à quelques questions pour trouver le module d'entraînement aux échecs adapté à votre niveau.",
};

export default function GuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Le guide"
        title="Quel module est fait pour vous ?"
        intro="Répondez à deux ou trois questions : nous vous recommandons le module d'entraînement le plus adapté à votre niveau actuel."
      />
      <section className="py-16 lg:py-24">
        <Container className="max-w-3xl">
          <ModuleGuide />
        </Container>
      </section>
    </>
  );
}
