import { Button, Container, SectionTitle } from "./ui";
import { mailto } from "@/lib/site";

export function FinalCta() {
  return (
    <section className="border-t border-navy-900/10 bg-white py-20">
      <Container className="text-center">
        <SectionTitle
          center
          eyebrow="Prêt à progresser ?"
          title="Parlons de vos objectifs"
          intro="Un premier échange avec le GMI Darko Anic permet d'évaluer votre niveau et de choisir la formule la plus adaptée."
        />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={mailto("Demande d'entretien")} variant="dark">
            Écrire à desk@cavalierbleu.com
          </Button>
          <Button href="/contact" variant="ghost">
            Toutes les coordonnées
          </Button>
        </div>
      </Container>
    </section>
  );
}
