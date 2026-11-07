import type { Metadata } from "next";
import { Button, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Paiement annulé", robots: { index: false } };

export default function CancelPage() {
  return (
    <section className="py-28">
      <Container className="max-w-2xl text-center">
        <h1 className="font-serif text-4xl text-navy-900">Paiement annulé</h1>
        <p className="mt-5 text-lg text-muted">
          Aucun montant n&apos;a été débité. Vous pouvez reprendre votre inscription quand vous le souhaitez, ou nous
          poser vos questions avant de vous décider.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button href="/inscription" variant="dark">
            Revenir à l&apos;inscription
          </Button>
          <Button href="/contact" variant="ghost">
            Nous contacter
          </Button>
        </div>
      </Container>
    </section>
  );
}
