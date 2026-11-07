import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { Container, PageHero } from "@/components/ui";
import { CONTACT, LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'Institut Le Cavalier Bleu : formulaire, e-mail ou téléphone.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de vos objectifs"
        intro="Une question, un cours d'essai, un projet pour votre club ? Écrivez-nous : nous répondons personnellement, en général sous 48 heures."
      />
      <section className="py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-6 sm:p-10">
            <h2 className="font-serif text-2xl text-navy-900">Envoyez-nous un message</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="flex items-center gap-4 rounded-3xl bg-navy-900 p-6 text-white">
              <Image src="/images/darko-echiquier.jpg" alt="Darko Anic" width={260} height={180} className="h-16 w-16 rounded-full object-cover" />
              <p className="text-sm text-white/80">
                Votre demande est lue par l&apos;Institut et le <strong className="text-white">GMI Darko Anic</strong>.
              </p>
            </div>
            {[
              { title: "E-mail", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { title: "Téléphone (France)", value: CONTACT.phoneFr, href: CONTACT.phoneHref },
              { title: "Depuis l'étranger", value: CONTACT.phoneIntl, href: CONTACT.phoneHref },
            ].map((c) => (
              <a key={c.title} href={c.href} className="group block rounded-3xl border border-navy-900/10 bg-white p-6 transition hover:shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{c.title}</p>
                <p className="mt-2 break-words font-serif text-xl text-navy-900 group-hover:text-brand-700">{c.value}</p>
              </a>
            ))}
            <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-3xl border border-navy-900/10 bg-white p-6 transition hover:shadow-lg">
              <Image src="/images/flogo.png" alt="" width={40} height={40} />
              <span className="text-sm">
                <span className="block font-semibold text-navy-900">Suivez-nous sur Facebook</span>
                <span className="text-muted">Événements, conférences, programmes</span>
              </span>
            </a>
          </aside>
        </Container>
      </section>
    </>
  );
}
