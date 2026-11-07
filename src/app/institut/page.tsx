import type { Metadata } from "next";
import Image from "next/image";
import { FinalCta } from "@/components/FinalCta";
import { Button, Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "L'Institut Le Cavalier Bleu",
  description: "Fondé en 1995 par le GMI Darko Anic, l'Institut Le Cavalier Bleu est un centre international de formation et d'enseignement des échecs.",
};

export default function InstitutPage() {
  return (
    <>
      <PageHero
        eyebrow="Présentation"
        title="L'Institut Le Cavalier Bleu"
        intro="Centre international de formation et d'enseignement des échecs, fondé en 1995 par le Grand-Maître International Darko Anic."
      />
      <section className="py-20 lg:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-ink">
            <p>
              Partant du constat qu&apos;il n&apos;existait en France aucune école d&apos;enseignement du jeu d&apos;échecs à
              distance, le GMI Darko Anic décide de créer la sienne en septembre 1995 : l&apos;Institut Le Cavalier Bleu.
            </p>
            <p>
              Il conçoit des outils qui s&apos;adressent à l&apos;ensemble de la communauté échiquéenne, sans privilégier une
              catégorie de joueurs plutôt qu&apos;une autre, et développe rapidement une variété de prestations inédites,
              qui remportent un vif succès.
            </p>
            <p>L&apos;activité de l&apos;Institut embrasse aujourd&apos;hui la quasi-totalité des secteurs de la formation aux échecs :</p>
            <ul className="space-y-2 pl-1">
              <li>— <strong>À distance</strong>, avec toute une gamme de modules et de prestations ;</li>
              <li>
                — <strong>En direct</strong>, à travers séminaires, conférences, cours, stages de formation et formation
                continue.
              </li>
            </ul>
            <p>
              Notre mission reste inchangée : <strong>promouvoir les échecs auprès d&apos;un vaste public</strong>. La
              longévité de l&apos;Institut atteste de la qualité de notre enseignement ; votre fidélité en témoigne. Nous
              vous en remercions.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button href="/darko-anic" variant="dark">
                Découvrir Darko Anic
              </Button>
              <Button href="/cours-a-distance" variant="ghost">
                Nos formules
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-navy-900/10 bg-white p-3">
              <Image src="/images/darko-echiquier.jpg" alt="Le GMI Darko Anic devant un échiquier" width={260} height={180} className="w-full rounded-2xl object-cover" />
            </div>
            <div className="flex items-center gap-5 rounded-3xl bg-navy-900 p-6 text-white">
              <Image src="/images/logo1.gif" alt="" width={100} height={71} unoptimized className="rounded" />
              <p className="text-sm text-white/80">Plus de 30 ans d&apos;enseignement des échecs, en France et à travers le monde.</p>
            </div>
          </div>
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
