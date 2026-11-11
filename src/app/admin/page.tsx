import Link from "next/link";
import { Suspense } from "react";
import { Card, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { usingPglite } from "@/db";
import { aiStatus } from "@/lib/ai/provider";
import { contentOverview, reviewQueue, studentsOverview } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";
import { usingBlob } from "@/lib/storage";

export default function AdminHome() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin();
  const [queue, students, content] = await Promise.all([reviewQueue(), studentsOverview(), contentOverview()]);
  const totals = content.modules.reduce((a, m) => ({ total: a.total + m.total, ready: a.ready + m.ready, sample: a.sample + m.sample }), { total: 0, ready: 0, sample: 0 });
  const tiles: [string, string | number, string][] = [
    ["À corriger", queue.length, "/admin/corrections"],
    ["Élèves inscrits", students.filter((s) => s.role !== "admin").length, "/admin/eleves"],
    ["Exercices réels en ligne", `${totals.ready} / ${totals.total}`, "/admin/contenus"],
    ["Exercices d'exemple", totals.sample, "/admin/contenus"],
  ];
  return (
    <Container className="py-10">
      <PageHeading eyebrow="Administration" title="Vue d'ensemble" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([l, v, href]) => (
          <Link key={l} href={href} className="rounded-3xl border border-navy-900/10 bg-white p-5 transition hover:border-brand-700">
            <p className="font-serif text-3xl text-navy-900">{v}</p>
            <p className="mt-1 text-sm text-muted">{l}</p>
          </Link>
        ))}
      </div>
      <Card className="mt-8">
        <h2 className="font-serif text-xl text-navy-900">Configuration</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">Base de données</dt>
          <dd>{usingPglite() ? "Locale (PGlite) — développement" : "Neon (Postgres)"}</dd>
          <dt className="text-muted">Stockage des cours</dt>
          <dd>{usingBlob() ? "Vercel Blob (privé)" : "Disque local — développement"}</dd>
          <dt className="text-muted">Correction par IA</dt>
          <dd>{aiStatus()}</dd>
          <dt className="text-muted">E-mails</dt>
          <dd>{process.env.RESEND_API_KEY ? "Resend" : "Non configurés (journalisés)"}</dd>
        </dl>
      </Card>
    </Container>
  );
}
