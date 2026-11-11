import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function AuthShell({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-hero relative overflow-hidden py-12 sm:py-20">
      <div className="grid-pattern absolute inset-0" aria-hidden />
      <Container className="relative max-w-md">
        <div className="rounded-3xl bg-cream p-6 shadow-2xl shadow-navy-950/30 sm:p-8">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Espace élève</p>
          <h1 className="mt-3 font-serif text-3xl text-navy-900">{title}</h1>
          {intro && <div className="mt-2 text-sm leading-relaxed text-muted">{intro}</div>}
          <div className="mt-6">{children}</div>
        </div>
      </Container>
    </section>
  );
}

export function FormFallback() {
  return <div className="h-64 animate-pulse rounded-2xl bg-brand-100/60" aria-hidden />;
}
