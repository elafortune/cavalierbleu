"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LINKS, NAV } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Menu mobile : bloque le défilement de la page et se ferme avec Échap.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/85 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)} aria-label="Accueil — Institut Le Cavalier Bleu">
          <Image
            src="/images/logo1.gif"
            alt=""
            width={58}
            height={41}
            unoptimized
            className="h-9 w-auto rounded-sm lg:h-11"
            priority
          />
          <span className="leading-tight">
            <span className="block font-display text-[10px] tracking-[0.35em] text-cyan-accent/80">INSTITUT</span>
            <span className="block whitespace-nowrap font-display text-sm font-bold tracking-wider text-cyan-accent lg:text-base">
              LE CAVALIER BLEU
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${
                isActive(item.href) ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <Link href={LINKS.espaceEtudiant} className="whitespace-nowrap text-sm text-white/70 transition-colors hover:text-white">
            Espace étudiant
          </Link>
          <Link
            href={LINKS.inscription}
            className="whitespace-nowrap rounded-full bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-lg shadow-cyan-accent/20 transition hover:bg-white"
          >
            S&apos;inscrire
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </header>

      {open && (
        <nav
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-white/10 bg-navy-950 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 lg:top-20 xl:hidden"
          aria-label="Navigation mobile"
        >
          {[{ href: "/", label: "Accueil" }, ...NAV, { href: "/contact", label: "Contact" }, { href: LINKS.espaceEtudiant, label: "Espace étudiant" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) && item.href !== "/" ? "page" : undefined}
              className={`block border-b border-white/5 py-3.5 text-lg ${isActive(item.href) && item.href !== "/" ? "text-cyan-accent" : "text-white/85"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={LINKS.inscription}
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-cyan-accent px-5 py-3 text-center font-semibold text-navy-950"
          >
            S&apos;inscrire
          </Link>
        </nav>
      )}
    </>
  );
}
