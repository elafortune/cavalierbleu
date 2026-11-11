import Link from "next/link";
import { Suspense } from "react";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { reviewQueue } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Corrections" };

export default function QueuePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Queue />
    </Suspense>
  );
}

const STATUS: Record<string, string> = { checked: "Vérifiée", ai_draft: "Brouillon IA prêt" };

async function Queue() {
  await requireAdmin();
  const rows = await reviewQueue();
  return (
    <Container className="py-10">
      <PageHeading eyebrow="Corrections" title="File de corrections" />
      <p className="mt-2 text-sm text-muted">Réponses en attente, de la plus ancienne à la plus récente. Note suggérée = vérification automatique.</p>
      {rows.length === 0 ? (
        <Card className="mt-6">Aucune réponse en attente. 🎉</Card>
      ) : (
        <Card className="mt-6 !p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Reçue le</th>
                  <th className="px-5 py-3">Élève</th>
                  <th className="px-5 py-3">Exercice</th>
                  <th className="px-5 py-3">Suggestion</th>
                  <th className="px-5 py-3">État</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/10">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-100/30">
                    <td className="px-5 py-3 text-muted">{fmtDate(r.createdAt)}</td>
                    <td className="px-5 py-3">{r.studentName}</td>
                    <td className="px-5 py-3 font-mono">{fmtNumber(r.exerciseNumber)}</td>
                    <td className="px-5 py-3">
                      <GradeBadge grade={r.aiGrade ?? r.suggestedGrade} />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {STATUS[r.status] ?? r.status}
                      {r.aiError && <span className="ml-1 text-red-700" title={r.aiError}>· erreur IA</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/corrections/${r.id}`} className="font-semibold text-brand-700 hover:underline">
                        Corriger →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Container>
  );
}
