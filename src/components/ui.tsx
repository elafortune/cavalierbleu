import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  // Une largeur passée en className (ex. max-w-3xl) remplace la largeur par défaut.
  const width = /(^|\s)max-w-/.test(className) ? "" : "max-w-7xl";
  return <div className={`mx-auto ${width} px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`font-display text-xs font-bold uppercase tracking-[0.3em] ${
        light ? "text-cyan-accent" : "text-brand-700"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  intro,
  light = false,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-3 font-serif text-3xl leading-tight sm:text-4xl ${light ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? "text-white/70" : "text-muted"}`}>{intro}</p>
      )}
    </div>
  );
}

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark" | "ghost";
  external?: boolean;
  className?: string;
};

export function Button({ href, children, variant = "primary", external, className = "" }: BtnProps) {
  const styles = {
    primary: "bg-cyan-accent text-navy-950 hover:bg-white shadow-lg shadow-cyan-accent/20",
    secondary: "border border-white/25 text-white hover:bg-white/10",
    dark: "bg-navy-900 text-white hover:bg-brand-700",
    ghost: "border border-navy-900/15 text-navy-900 hover:border-navy-900/40 hover:bg-white",
  }[variant];
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${styles} ${className}`;
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal) {
    const newTab = href.startsWith("http");
    return (
      <a href={href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={`h-5 w-5 flex-none ${className}`}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-hero relative overflow-hidden text-white">
      <div className="grid-pattern absolute inset-0" aria-hidden />
      <Container className="relative py-20 lg:py-28">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
