import { PLACEHOLDER_TESTIMONIALS, TESTIMONIALS } from "@/content/testimonials";
import { Container, SectionTitle } from "./ui";

export function Testimonials({ limit = 6 }: { limit?: number }) {
  const items = TESTIMONIALS.slice(0, limit);
  return (
    <section className="bg-cream-200 py-20 lg:py-28">
      <Container>
        <SectionTitle
          center
          eyebrow="Ils progressent avec nous"
          title="Ce qu'en disent nos élèves"
          intro="Débutants, compétiteurs, enseignants : chacun trouve à l'Institut un accompagnement à sa mesure."
        />
        <div className="mt-14 columns-1 gap-5 md:columns-2 lg:columns-3">
          {items.map((t) => (
            <figure key={t.name} className="mb-5 break-inside-avoid rounded-3xl border border-navy-900/10 bg-white p-7">
              <div className="flex gap-0.5 text-brand-700" aria-label="5 étoiles sur 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mt-4 leading-relaxed text-ink">« {t.quote} »</blockquote>
              <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-navy-900/10 pt-4">
                <span>
                  <span className="block font-semibold text-navy-900">{t.name}</span>
                  <span className="text-sm text-muted">{t.detail}</span>
                </span>
                <span className="whitespace-nowrap rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  {t.formula}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        {PLACEHOLDER_TESTIMONIALS && (
          <p className="mt-6 text-center text-xs text-muted">
            Témoignages d&apos;exemple — les avis de nos élèves seront publiés prochainement.
          </p>
        )}
      </Container>
    </section>
  );
}
