import type { Metadata } from "next";
import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { Button, Container, PageHero, SectionTitle } from "@/components/ui";
import { MODULES } from "@/content/modules";
import { formatPrice, getProduct } from "@/lib/catalog";
import { LINKS, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Inscription et paiement en ligne",
  description: "Inscrivez-vous aux modules, cours individuels et fiches pédagogiques de l'Institut Le Cavalier Bleu. Paiement sécurisé par carte.",
};

function Row({ name, detail, price, productId, contact }: { name: string; detail?: string; price: string; productId?: string; contact?: string }) {
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-navy-900">{name}</p>
        {detail && <p className="text-sm text-muted">{detail}</p>}
      </div>
      <div className="flex items-center gap-4">
        <p className="w-20 text-right font-serif text-xl text-navy-900">{price}</p>
        <div className="w-44">
          {productId ? (
            <BuyButton productId={productId} label="Payer" />
          ) : (
            <Button href={contact ?? mailto()} variant="ghost" className="w-full !py-2.5">
              Nous contacter
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

const card = "rounded-3xl border border-navy-900/10 bg-white px-6 py-2 sm:px-8";

export default function InscriptionPage() {
  return (
    <>
      <PageHero
        eyebrow="Inscription"
        title="Inscrivez-vous en quelques clics"
        intro="Choisissez votre formule et réglez en ligne par carte bancaire, en toute sécurité. Vous recevez immédiatement une confirmation, puis votre module ou la prise de contact de votre entraîneur."
      >
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">🔒 Paiement sécurisé Stripe</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">Facture envoyée par e-mail</span>
          <Link href={LINKS.elan2026} className="inline-flex items-center gap-2 rounded-full bg-cyan-accent px-4 py-2 font-semibold text-navy-950">
            Promotion ÉLAN 2026 →
          </Link>
        </div>
      </PageHero>

      <section className="py-20">
        <Container className="max-w-5xl space-y-16">
          <div id="modules" className="scroll-mt-24">
            <SectionTitle eyebrow="Enseignement à distance" title="Modules d'entraînement" intro={<>Vous hésitez ? <Link href={LINKS.guide} className="font-semibold text-brand-700 hover:underline">Le guide</Link> vous oriente en une minute.</>} />
            <ul className={`mt-8 divide-y divide-navy-900/10 ${card}`}>
              {MODULES.map((m) => (
                <Row
                  key={m.id}
                  name={m.name}
                  detail={`${m.cycle} · ${m.level}`}
                  price={m.productId ? formatPrice(getProduct(m.productId)!.amount) : m.price}
                  productId={m.productId}
                  contact={mailto(m.name)}
                />
              ))}
            </ul>
          </div>

          <div id="cours" className="scroll-mt-24">
            <SectionTitle eyebrow="En direct" title="Cours individuels à distance" />
            <ul className={`mt-8 divide-y divide-navy-900/10 ${card}`}>
              {(["cours-1h", "cours-10h", "cours-20h"] as const).map((id) => {
                const p = getProduct(id)!;
                return <Row key={id} name={p.name} detail={p.description} price={formatPrice(p.amount)} productId={id} />;
              })}
              <Row name="Coaching individuel" detail="Sur entretien préalable" price="—" contact={mailto("Coaching")} />
              <Row name="Stage intensif individuel" detail="Programme établi après bilan" price="Devis" contact={mailto("Devis entraînement individuel")} />
            </ul>
          </div>

          <div id="seminaires" className="scroll-mt-24">
            <SectionTitle eyebrow="Collectif" title="Séminaires" intro="Le calendrier est en préparation : écrivez-nous pour réserver votre place sur la prochaine session." />
            <ul className={`mt-8 divide-y divide-navy-900/10 ${card}`}>
              <Row name="Inscription Adultes" detail="185 € pour le séminaire à Paris" price="160 €" contact={mailto("Séminaire — Adulte")} />
              <Row name="Inscription Jeunes" detail="155 € pour le séminaire à Paris" price="120 €" contact={mailto("Séminaire — Jeune")} />
            </ul>
          </div>

          <div id="formation" className="scroll-mt-24">
            <SectionTitle eyebrow="Formation professionnelle" title="Diplômes FFE" />
            <ul className={`mt-8 divide-y divide-navy-900/10 ${card}`}>
              <Row name="Formation : animateur" detail="DIFFE, DAFFE 1" price="—" contact={mailto("Formation : animateur")} />
              <Row name="Formation : éducateur" detail="DAFFE 2" price="—" contact={mailto("Formation : éducateur")} />
              <Row name="Formation : entraîneur" detail="DEFFE 1" price="—" contact={mailto("Formation : entraîneur")} />
            </ul>
          </div>

          <div id="fiches" className="scroll-mt-24">
            <SectionTitle eyebrow="Pour enseigner" title="Fiches pédagogiques" />
            <ul className={`mt-8 divide-y divide-navy-900/10 ${card}`}>
              {(["fiches-n1", "fiches-n2", "fiches-n1-n2"] as const).map((id) => {
                const p = getProduct(id)!;
                return <Row key={id} name={p.name} detail={p.description} price={formatPrice(p.amount)} productId={id} />;
              })}
            </ul>
          </div>

          <p className="text-sm text-muted">
            Vous préférez régler par virement ? Écrivez-nous à{" "}
            <a href={mailto("Inscription par virement")} className="font-semibold text-brand-700 hover:underline">
              desk@cavalierbleu.com
            </a>{" "}
            pour recevoir notre RIB. En vous inscrivant, vous acceptez nos{" "}
            <Link href={LINKS.conditions} className="font-semibold text-brand-700 hover:underline">
              conditions
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
