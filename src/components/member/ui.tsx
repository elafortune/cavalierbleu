import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function PageSkeleton() {
  return (
    <Container className="py-10">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-navy-900/10" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-white" />
        ))}
      </div>
    </Container>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-700">{eyebrow}</p>}
        <h1 className="mt-2 font-serif text-3xl text-navy-900 sm:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-navy-900/10 bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}

const GRADE_STYLE: Record<string, string> = {
  "+": "bg-emerald-100 text-emerald-800",
  "-": "bg-red-100 text-red-800",
  "!?": "bg-amber-100 text-amber-800",
  "?!": "bg-orange-100 text-orange-800",
  "?": "bg-sky-100 text-sky-800",
};

export function GradeBadge({ grade, title }: { grade: string | null | undefined; title?: string }) {
  if (!grade) return null;
  return (
    <span title={title} className={`inline-flex min-w-9 items-center justify-center rounded-full px-2 py-0.5 font-mono text-sm font-bold ${GRADE_STYLE[grade] ?? "bg-navy-900/10"}`}>
      {grade}
    </span>
  );
}

export function SampleBadge() {
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">Exemple</span>;
}

export const fmtDate = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(new Date(d)) : "";

export const fmtNumber = (n: number) => String(n).padStart(4, "0");
