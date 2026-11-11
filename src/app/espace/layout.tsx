import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/member/AuthForms";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Espace élève", template: "%s · Espace élève · Le Cavalier Bleu" },
  robots: { index: false },
};

export default function EspaceLayout({ children }: LayoutProps<"/espace">) {
  return (
    <div className="bg-cream-200/40 pb-20">
      <div className="border-b border-navy-900/10 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium" aria-label="Espace élève">
            <Link href="/espace" className="rounded-full px-3 py-2 text-navy-900 hover:bg-brand-100">
              Tableau de bord
            </Link>
            <Link href="/cours-a-distance" className="rounded-full px-3 py-2 text-muted hover:bg-brand-100 hover:text-navy-900">
              Catalogue des modules
            </Link>
          </nav>
          <SignOutButton className="rounded-full px-3 py-2 text-sm text-muted hover:bg-brand-100 hover:text-navy-900" />
        </Container>
      </div>
      {children}
    </div>
  );
}
