import Link from "next/link";
import { Suspense } from "react";
import { UploadForm } from "@/components/member/AdminForms";
import { Card, fmtDate, fmtNumber, PageHeading, PageSkeleton, SampleBadge } from "@/components/member/ui";
import { Container } from "@/components/ui";
import type { ImportReport } from "@/lib/content/import";
import { contentOverview } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Contenus" };

export default function ContentPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const c = await contentOverview();
  return (
    <Container className="py-10">
      <PageHeading eyebrow="Contenus pédagogiques" title="Exercices, cours et corrections" />

      <Card className="mt-6">
        <h2 className="font-serif text-lg text-navy-900">Importer des fichiers</h2>
        <p className="mt-1 text-sm text-muted">
          <strong>PGN</strong> (un ou plusieurs exercices ; numéro lu dans l&apos;en-tête, ex. « MV-0825 » ou [Exercise &quot;0825&quot;]) ·{" "}
          <strong>PDF</strong> de cours (choisir le module ; jusqu&apos;à ~4 Mo ici, au-delà utiliser l&apos;import en ligne de commande) ·{" "}
          <strong>DOCX / MD / TXT</strong> de corrections (corrections types A, B… et réponses historiques). Un import peut être relancé : il met à
          jour sans créer de doublon et ne remplace jamais un contenu réel par un exemple.
        </p>
        <div className="mt-4">
          <UploadForm modules={c.modules.map((m) => ({ id: m.id, name: m.name }))} />
        </div>
      </Card>

      <Card className="mt-6 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">Exercices réels</th>
                <th className="px-5 py-3">Exemples</th>
                <th className="px-5 py-3">En attente</th>
                <th className="px-5 py-3">Cours PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/10">
              {c.modules.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3 font-medium text-navy-900">{m.name}</td>
                  <td className="px-5 py-3">
                    {m.ready} / {m.total}
                    <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-brand-100">
                      <div className="h-full bg-emerald-600" style={{ width: `${m.total ? (m.ready / m.total) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">{m.sample}</td>
                  <td className="px-5 py-3">{m.total - m.ready - m.sample}</td>
                  <td className="px-5 py-3">
                    {m.courses.n - m.courses.samples} réel(s){m.courses.samples ? ` · ${m.courses.samples} exemple` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-lg text-navy-900">Exercices avec contenu</h2>
          <p className="mt-1 text-xs text-muted">
            {c.templatesFor} exercice(s) avec corrections types · {c.legacyAnswers} réponses historiques importées
          </p>
          <ul className="mt-4 grid max-h-96 grid-cols-1 gap-1 overflow-y-auto text-sm sm:grid-cols-2">
            {c.withContent.map((e) => (
              <li key={e.number}>
                <Link href={`/admin/exercices/${e.number}`} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-brand-100">
                  <span className="font-mono">{fmtNumber(e.number)}</span>
                  <span className="text-xs text-muted">{e.moduleId}</span>
                  {e.status === "sample" && <SampleBadge />}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-serif text-lg text-navy-900">Derniers imports</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {c.runs.map((r) => {
              const rep = r.report as ImportReport;
              return (
                <li key={r.id} className="rounded-xl border border-navy-900/10 p-3">
                  <p className="font-medium text-navy-900">
                    [{r.kind}] {rep.source}
                  </p>
                  <p className="text-xs text-muted">
                    {fmtDate(r.startedAt)} · +{rep.created} · {rep.updated} maj · {rep.unchanged} inchangés
                    {rep.errors.length > 0 && <span className="text-red-700"> · {rep.errors.length} erreur(s)</span>}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </Container>
  );
}
