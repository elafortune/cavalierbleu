import Link from "next/link";
import { Suspense } from "react";
import { MODULES } from "@/content/modules";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Button, Container } from "@/components/ui";
import { accessibleModuleIds, listModules } from "@/lib/platform/access";
import { moduleProgress, studentStats } from "@/lib/platform/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Tableau de bord" };

export default function EspacePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const me = await requireUser("/espace");
  const ids = await accessibleModuleIds(me.email, me.role === "admin");
  const [mods, progress, stats] = await Promise.all([listModules(ids), moduleProgress(ids, me.id), studentStats(me.id)]);

  return (
    <Container className="py-10">
      <PageHeading eyebrow="Tableau de bord" title={`Bonjour ${me.name.split(" ")[0]}`}>
        {me.role === "admin" && <Button href="/admin" variant="dark">Administration</Button>}
      </PageHeading>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Exercices travaillés", stats.exercises],
          ["Réponses envoyées", stats.attempts],
          ["Corrections reçues", stats.published],
          ["Réponses justes (+)", stats.success],
        ].map(([l, v]) => (
          <Card key={l as string} className="!p-4">
            <p className="font-serif text-3xl text-navy-900">{v}</p>
            <p className="mt-1 text-xs text-muted">{l}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 font-serif text-2xl text-navy-900">Mes modules</h2>
      {mods.length === 0 ? (
        <Card className="mt-4">
          <p className="text-ink">Aucun module n&apos;est encore associé à votre compte ({me.email}).</p>
          <p className="mt-2 text-sm text-muted">
            Si vous avez acheté un module avec une autre adresse e-mail, contactez-nous pour le rattacher.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/cours-a-distance" variant="dark">Découvrir les modules</Button>
            <Button href="/guide" variant="ghost">Quel module pour mon niveau ?</Button>
          </div>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mods.map((m) => {
            const p = progress.find((x) => x.moduleId === m.id);
            const color = MODULES.find((x) => x.id === m.id)?.color ?? "#1a6db1";
            const pct = p && p.available ? Math.round((p.done / p.available) * 100) : 0;
            return (
              <Link key={m.id} href={`/espace/modules/${m.id}`} className="group block rounded-3xl border border-navy-900/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy-900/10">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                  <h3 className="font-serif text-xl text-navy-900">{m.name}</h3>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {p ? `${p.done} exercice(s) travaillé(s) · ${p.available} disponible(s) sur ${p.total}` : "Contenu à venir"}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-100" aria-label={`Progression ${pct} %`}>
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-4 text-sm font-semibold text-brand-700 group-hover:underline">Ouvrir le module →</p>
              </Link>
            );
          })}
        </div>
      )}

      {stats.recent.length > 0 && (
        <>
          <h2 className="mt-12 font-serif text-2xl text-navy-900">Dernières corrections</h2>
          <Card className="mt-4 !p-0">
            <ul className="divide-y divide-navy-900/10">
              {stats.recent.map((r) => (
                <li key={`${r.number}-${r.publishedAt}`}>
                  <Link href={`/espace/exercices/${r.number}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-100/40">
                    <span className="font-medium text-navy-900">Exercice {fmtNumber(r.number)}</span>
                    <span className="flex items-center gap-3 text-sm text-muted">
                      {fmtDate(r.publishedAt)} <GradeBadge grade={r.grade} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </Container>
  );
}
