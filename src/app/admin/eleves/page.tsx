import Link from "next/link";
import { Suspense } from "react";
import { revokeAction } from "@/app/admin/actions";
import { GrantForm } from "@/components/member/AdminForms";
import { Card, fmtDate, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { listModules } from "@/lib/platform/access";
import { studentsOverview } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";
import { db } from "@/db";
import { entitlements } from "@/db/schema";

export const metadata = { title: "Élèves" };

export default function StudentsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Students />
    </Suspense>
  );
}

async function Students() {
  await requireAdmin();
  const [students, mods, ents] = await Promise.all([studentsOverview(), listModules(), db.select().from(entitlements)]);
  const name = (id: string) => mods.find((m) => m.id === id)?.name.replace("Module ", "") ?? id;
  const registered = new Set(students.map((s) => s.email.toLowerCase()));
  const pendingAccounts = [...new Set(ents.filter((e) => !registered.has(e.email)).map((e) => e.email))];

  return (
    <Container className="py-10">
      <PageHeading eyebrow="Suivi" title="Élèves" />
      <Card className="mt-6">
        <h2 className="font-serif text-lg text-navy-900">Ouvrir un module à un élève</h2>
        <p className="mt-1 text-sm text-muted">Paiement hors ligne, offre, ancien élève… L&apos;élève y aura accès dès qu&apos;il crée son compte avec cet e-mail.</p>
        <div className="mt-4">
          <GrantForm modules={mods.map((m) => ({ id: m.id, name: m.name }))} />
        </div>
      </Card>

      <Card className="mt-6 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Élève</th>
                <th className="px-5 py-3">Modules</th>
                <th className="px-5 py-3">Exercices</th>
                <th className="px-5 py-3">Réussite</th>
                <th className="px-5 py-3">À corriger</th>
                <th className="px-5 py-3">Dernière réponse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/10">
              {students.map((s) => {
                const rate = s.stats && s.stats.published ? Math.round((s.stats.success / s.stats.published) * 100) : null;
                return (
                  <tr key={s.id} className="hover:bg-brand-100/30">
                    <td className="px-5 py-3">
                      <Link href={`/admin/eleves/${s.id}`} className="font-medium text-navy-900 hover:text-brand-700">
                        {s.name}
                      </Link>
                      {s.role === "admin" && <span className="ml-2 rounded bg-navy-900 px-1.5 text-[10px] text-white">admin</span>}
                      <span className="block text-xs text-muted">{s.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.modules.map((m) => (
                          <form key={m} action={revokeAction} className="inline">
                            <input type="hidden" name="email" value={s.email} />
                            <input type="hidden" name="module" value={m} />
                            <button title="Retirer l'accès" className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-navy-900 hover:bg-red-100 hover:line-through">
                              {name(m)}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">{s.stats?.exercises ?? 0}</td>
                    <td className="px-5 py-3">{rate === null ? "—" : `${rate} %`}</td>
                    <td className="px-5 py-3">{s.stats?.pending ?? 0}</td>
                    <td className="px-5 py-3 text-muted">{fmtDate(s.stats?.last)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {pendingAccounts.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-serif text-lg text-navy-900">Accès ouverts, compte pas encore créé</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {pendingAccounts.map((e) => (
              <li key={e}>
                {e} — {ents.filter((x) => x.email === e).map((x) => name(x.moduleId)).join(", ")}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Container>
  );
}
