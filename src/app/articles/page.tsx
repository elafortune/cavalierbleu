import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FinalCta } from "@/components/FinalCta";
import { Container, PageHero } from "@/components/ui";
import { ARTICLES } from "@/content/articles";

export const metadata: Metadata = {
  title: "Articles — Études thématiques",
  description: "Études thématiques du GMI Darko Anic sur les structures de pions : pion isolé, Karlsbad, Boleslavsky, Est-Indienne…",
};

export default function ArticlesPage() {
  return (
    <>
      <PageHero
        eyebrow="Articles"
        title="Études thématiques"
        intro="Les structures de pions racontées par le GMI Darko Anic : comprendre les plans typiques pour mieux jouer toutes les positions qui en découlent."
      />
      <section className="py-20">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="group flex flex-col rounded-3xl border border-navy-900/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-700/10"
            >
              <div className="flex items-center gap-4">
                <Image src={a.cover} alt="" width={108} height={108} className="h-20 w-20 rounded-2xl object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{a.theme}</p>
                  <h2 className="mt-1 font-serif text-xl text-navy-900">{a.title}</h2>
                </div>
              </div>
              <p className="mt-5 flex-1 text-sm leading-relaxed text-muted">{a.excerpt}</p>
              <p className="mt-5 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">
                Lire l&apos;article ({a.pages.length} parties) →
              </p>
            </Link>
          ))}
        </Container>
      </section>
      <FinalCta />
    </>
  );
}
