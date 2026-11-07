import Image from "next/image";
import Link from "next/link";
import { CONTACT, LINKS } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";

const cols = [
  {
    title: "Apprendre",
    links: [
      { href: "/entrainement", label: "Cours individuels & coaching" },
      { href: LINKS.modules, label: "Modules à distance" },
      { href: LINKS.guide, label: "Choisir son module" },
      { href: "/entrainement#seminaires", label: "Séminaires" },
      { href: LINKS.formation, label: "Formation diplômante FFE" },
      { href: LINKS.outils, label: "Fiches pédagogiques" },
      { href: LINKS.articles, label: "Articles" },
    ],
  },
  {
    title: "L'Institut",
    links: [
      { href: LINKS.institut, label: "Présentation" },
      { href: "/darko-anic", label: "GMI Darko Anic" },
      { href: "/tarifs", label: "Tarifs" },
      { href: LINKS.elan2026, label: "Promotion ÉLAN 2026" },
      { href: LINKS.inscription, label: "Inscription" },
      { href: LINKS.espaceEtudiant, label: "Espace étudiant" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/contact", label: "Contact" },
      { href: LINKS.faq, label: "FAQ" },
      { href: LINKS.conditions, label: "Conditions" },
      { href: LINKS.liens, label: "Liens" },
      { href: LINKS.plan, label: "Plan du site" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:px-8">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image src="/images/logo1.gif" alt="" width={72} height={51} unoptimized className="rounded-sm" />
            <p className="font-display text-sm font-bold tracking-wider text-cyan-accent">
              INSTITUT
              <br />
              LE CAVALIER BLEU
            </p>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Centre international de formation et d&apos;enseignement des échecs, fondé en 1995 par le
            Grand-Maître International Darko Anic.
          </p>
          <div className="mt-5 text-sm">
            <a href={`mailto:${CONTACT.email}`} className="block py-2 text-white hover:text-cyan-accent">
              {CONTACT.email}
            </a>
            <a href={CONTACT.phoneHref} className="block py-2 hover:text-cyan-accent">
              {CONTACT.phoneFr} <span className="text-white/40">· {CONTACT.phoneIntl}</span>
            </a>
          </div>
          <a
            href={LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm hover:text-white"
          >
            <Image src="/images/flogo.png" alt="" width={20} height={20} className="rounded" />
            Suivez l&apos;Institut sur Facebook
          </a>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{col.title}</p>
            <ul className="mt-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="inline-block py-1.5 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/40 sm:px-6 lg:px-8">
          © Copyright 2001–<CopyrightYear /> CavalierBleu, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
