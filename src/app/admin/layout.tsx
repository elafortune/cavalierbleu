import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration · Le Cavalier Bleu" },
  robots: { index: false, follow: false },
};

const NAV = [
  ["/admin", "Vue d'ensemble"],
  ["/admin/corrections", "Corrections"],
  ["/admin/eleves", "Élèves"],
  ["/admin/contenus", "Contenus"],
  ["/admin/expertise", "Base d'expertise"],
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="bg-cream-200/40 pb-20">
      <div className="bg-navy-900 text-white">
        <Container className="flex flex-wrap items-center gap-1 py-3 text-sm font-medium">
          <span className="mr-3 font-display text-xs uppercase tracking-[0.25em] text-cyan-accent">Administration</span>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
          <Link href="/espace" className="ml-auto rounded-full px-3 py-2 text-white/60 hover:bg-white/10 hover:text-white">
            Espace élève →
          </Link>
        </Container>
      </div>
      {children}
    </div>
  );
}
