import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MODULES } from "@/content/modules";
import { Card, fmtNumber, GradeBadge, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Button, Container } from "@/components/ui";
import { hasModuleAccess } from "@/lib/platform/access";
import { moduleOverview, type ExerciseState } from "@/lib/platform/queries";
import { requireUser } from "@/lib/session";

export default function ModulePage({ params }: PageProps<"/espace/modules/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModuleContent params={params} />
    </Suspense>
  );
}

const STATE: Record<ExerciseState, { cls: string; label: string }> = {
  indisponible: { cls: "border-dashed border-navy-900/15 bg-transparent text-navy-900/30", label: "contenu à venir" },
  "a-faire": { cls: "border-navy-900/15 bg-white text-navy-900 hover:border-brand-700 hover:bg-brand-100", label: "à faire" },
  envoye: { cls: "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500", label: "réponse envoyée" },
  corrige: { cls: "border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-500", label: "corrigé" },
};

async function ModuleContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireUser(`/espace/modules/${id}`);
  const data = await moduleOverview(id, me.id);
  if (!data) notFound();
  if (!(await hasModuleAccess(me.email, id, me.role === "admin"))) {
    const product = MODULES.find((m) => m.id === id);
    return (
      <Container className="py-10">
        <PageHeading eyebrow="Module" title={data.module.name} />
        <Card className="mt-6">
          <p>Ce module n&apos;est pas associé à votre compte.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href={`/cours-a-distance#${id}`} variant="dark">Découvrir le {data.module.name}{product ? ` — ${product.price}` : ""}</Button>
            <Button href="/espace" variant="ghost">Retour au tableau de bord</Button>
          </div>
        </Card>
      </Container>
    );
  }
  const color = MODULES.find((m) => m.id === id)?.color ?? "#1a6db1";
  const total = data.dossiers.reduce((a, d) => a + d.exercises.length, 0);
  const available = data.dossiers.reduce((a, d) => a + d.available, 0);

  return (
    <Container className="py-10">
      <PageHeading
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} aria-hidden /> Module
          </span>
        }
        title={data.module.name}
      >
        <p className="text-sm text-muted">
          {available} exercice(s) disponible(s) en ligne sur {total}
        </p>
      </PageHeading>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-navy-900">Cours</h2>
        {data.courses.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Les cours de ce module seront bientôt disponibles en ligne.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((c) => (
              <a
                key={c.id}
                href={`/espace/cours/${c.id}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 rounded-2xl border border-navy-900/10 bg-white p-4 transition hover:border-brand-700 hover:bg-brand-100/40"
              >
                <span className="flex h-12 w-10 flex-none items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">PDF</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-navy-900">{c.title}</span>
                  <span className="text-xs text-muted">
                    {c.sizeBytes >= 1024 * 1024 ? `${(c.sizeBytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(c.sizeBytes / 1024))} Ko`} {c.isSample && "· exemple"}
                  </span>
                </span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl text-navy-900">Exercices par dossier</h2>
          <ul className="flex flex-wrap gap-3 text-xs text-muted">
            {(Object.keys(STATE) as ExerciseState[]).map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded border ${STATE[s].cls}`} /> {STATE[s].label}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 space-y-4">
          {data.dossiers.map((d, i) => (
            <details key={d.id} open={i === 0 || d.available > 0} className="group rounded-3xl border border-navy-900/10 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <span>
                  <span className="font-serif text-lg text-navy-900">{d.label}</span>
                  <span className="ml-2 text-sm text-muted">
                    exercices {fmtNumber(d.firstExercise)} à {fmtNumber(d.lastExercise)}
                  </span>
                </span>
                <span className="text-sm text-muted">
                  {d.done}/{d.exercises.length} <span className="ml-1 inline-block transition group-open:rotate-180">▾</span>
                </span>
              </summary>
              <div className="grid grid-cols-4 gap-2 px-5 pb-5 sm:grid-cols-8 lg:grid-cols-12">
                {d.exercises.map((e) => {
                  const st = STATE[e.state];
                  const content = (
                    <>
                      <span className="font-mono text-xs">{fmtNumber(e.number)}</span>
                      {e.grade && <GradeBadge grade={e.grade} />}
                    </>
                  );
                  return e.state === "indisponible" ? (
                    <span key={e.number} title={st.label} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border ${st.cls}`}>
                      {content}
                    </span>
                  ) : (
                    <Link
                      key={e.number}
                      href={`/espace/exercices/${e.number}`}
                      title={`${e.prompt ?? ""} (${st.label})`}
                      className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border transition ${st.cls}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </details>
          ))}
          {data.dossiers.length === 0 && <p className="text-sm text-muted">Les exercices de ce module seront bientôt disponibles.</p>}
        </div>
      </section>
    </Container>
  );
}
