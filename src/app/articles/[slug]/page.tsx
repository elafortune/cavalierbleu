import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button, Container, Eyebrow } from "@/components/ui";
import { ARTICLES, getArticle } from "@/content/articles";
import { LINKS, mailto } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  return (
    <Suspense fallback={<div className="bg-hero h-72" aria-busy="true" />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: { params: PageProps<"/articles/[slug]">["params"] }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const idx = ARTICLES.indexOf(article);
  const next = ARTICLES[(idx + 1) % ARTICLES.length];

  return (
    <>
      <section className="bg-hero relative overflow-hidden text-white">
        <div className="grid-pattern absolute inset-0" aria-hidden />
        <Container className="relative max-w-4xl py-16 lg:py-20">
          <Link href={LINKS.articles} className="-my-2 inline-block py-2 text-sm text-white/60 hover:text-white">
            ← Tous les articles
          </Link>
          <div className="mt-6">
            <Eyebrow light>{article.theme}</Eyebrow>
          </div>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">{article.excerpt}</p>
          <p className="mt-6 text-sm text-white/50">Par le GMI Darko Anic · {article.pages.length} parties</p>
        </Container>
      </section>

      <article className="py-16">
        <Container className="max-w-3xl">
          {article.pages.length > 1 && (
            <nav aria-label="Parties de l'article" className="mb-12 flex flex-wrap gap-2">
              {article.pages.map((_, i) => (
                <a key={i} href={`#partie-${i + 1}`} className="rounded-full border border-navy-900/15 px-4 py-1.5 text-sm text-navy-900 hover:border-brand-700 hover:text-brand-700">
                  Partie {i + 1}
                </a>
              ))}
            </nav>
          )}
          {article.pages.map((page, i) => (
            <section key={i} id={`partie-${i + 1}`} className="scroll-mt-24 border-t border-navy-900/10 pt-10 first:border-0 first:pt-0 [&+section]:mt-12">
              {article.pages.length > 1 && <p className="mb-6 font-display text-xs font-bold tracking-[0.25em] text-brand-700">PARTIE {i + 1}</p>}
              <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink">
                {page.blocks.map((b, j) =>
                  b.t === "img" ? (
                    <figure key={j} className="my-8 flex justify-center">
                      <Image
                        src={b.src}
                        alt="Diagramme de la position"
                        width={180}
                        height={180}
                        unoptimized
                        className="h-auto w-full max-w-[300px] rounded-lg border border-navy-900/10 bg-white p-2 [image-rendering:auto]"
                      />
                    </figure>
                  ) : (
                    <p key={j}>{b.x}</p>
                  ),
                )}
              </div>
            </section>
          ))}

          <div className="mt-16 rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
            <p className="font-serif text-2xl">Envie d&apos;approfondir ces structures ?</p>
            <p className="mt-2 text-white/70">
              Les modules Azur, Turquoise et Indigo étudient en profondeur les plans liés aux structures de pions, avec
              un suivi personnalisé.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/cours-a-distance#azur">Voir les modules</Button>
              <Button href={mailto("Cours individuel")} variant="secondary">
                Travailler avec Darko
              </Button>
            </div>
          </div>

          <Link href={`/articles/${next.slug}`} className="mt-8 flex items-center justify-between rounded-3xl border border-navy-900/10 bg-white p-6 hover:border-brand-700/40">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Article suivant</span>
              <span className="font-serif text-xl text-navy-900">{next.title}</span>
            </span>
            <span className="text-brand-700">→</span>
          </Link>
        </Container>
      </article>
    </>
  );
}
