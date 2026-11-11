import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { db } from "@/db";
import { user } from "@/db/schema";
import { studentHistory, studentThemes } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export default function StudentPage({ params }: PageProps<"/admin/eleves/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Student params={params} />
    </Suspense>
  );
}

async function Student({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [u] = await db.select().from(user).where(eq(user.id, id));
  if (!u) notFound();
  const [themes, history] = await Promise.all([studentThemes(id), studentHistory(id)]);

  return (
    <Container className="py-10">
      <Link href="/admin/eleves" className="text-sm text-muted hover:text-navy-900">← Élèves</Link>
      <div className="mt-3">
        <PageHeading eyebrow={u.email} title={u.name}>
          <p className="text-sm text-muted">Inscrit le {fmtDate(u.createdAt)}</p>
        </PageHeading>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="font-serif text-xl text-navy-900">Réussite par thème</h2>
          <p className="mt-1 text-xs text-muted">Corrections publiées · thèmes les plus fragiles en premier</p>
          {themes.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Pas encore de correction.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {themes.map((t) => {
                const pct = Math.round((t.success / t.total) * 100);
                return (
                  <li key={t.theme}>
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-900">{t.theme}</span>
                      <span className="text-muted">
                        {t.success}/{t.total} · {pct} %
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-100">
                      <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-600" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card className="!p-0">
          <h2 className="px-5 pt-5 font-serif text-xl text-navy-900 sm:px-6 sm:pt-6">Historique des réponses</h2>
          <ul className="mt-3 divide-y divide-navy-900/10">
            {history.map((h) => (
              <li key={h.correctionId}>
                <Link href={`/admin/corrections/${h.correctionId}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-brand-100/30 sm:px-6">
                  <span className="font-mono">{fmtNumber(h.number)}</span>
                  <span className="text-muted">{fmtDate(h.createdAt)}</span>
                  <span className="flex items-center gap-2">
                    {h.status === "published" ? <GradeBadge grade={h.grade} /> : <span className="text-xs text-amber-700">à corriger ({h.suggested})</span>}
                  </span>
                </Link>
              </li>
            ))}
            {history.length === 0 && <li className="px-6 py-4 text-sm text-muted">Aucune réponse.</li>}
          </ul>
        </Card>
      </div>
    </Container>
  );
}
