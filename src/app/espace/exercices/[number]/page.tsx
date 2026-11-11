import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PgnViewer } from "@/components/chess/PgnViewer";
import { AnswerForm } from "@/components/member/AnswerForm";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton, SampleBadge } from "@/components/member/ui";
import { Button, Container } from "@/components/ui";
import { GRADE_LEGEND, type Grade } from "@/lib/chess/check";
import { sanToFrench } from "@/lib/chess/french";
import { parseSinglePgn } from "@/lib/chess/pgn";
import { hasModuleAccess } from "@/lib/platform/access";
import { answerLines } from "@/lib/platform/corrections";
import { exerciseForStudent } from "@/lib/platform/queries";
import { requireUser } from "@/lib/session";

export default function ExercisePage({ params }: PageProps<"/espace/exercices/[number]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExerciseContent params={params} />
    </Suspense>
  );
}

async function ExerciseContent({ params }: { params: Promise<{ number: string }> }) {
  const { number: raw } = await params;
  const number = Number(raw);
  if (!Number.isInteger(number)) notFound();
  const me = await requireUser(`/espace/exercices/${number}`);
  const data = await exerciseForStudent(number, me.id);
  if (!data) notFound();
  const { exercise: ex, dossier, module: mod, history, neighbours } = data;
  if (!(await hasModuleAccess(me.email, ex.moduleId, me.role === "admin"))) {
    return (
      <Container className="py-10">
        <Card>
          <p>Cet exercice fait partie du {mod.name}, qui n&apos;est pas associé à votre compte.</p>
          <div className="mt-4">
            <Button href={`/cours-a-distance#${mod.id}`} variant="dark">Découvrir le {mod.name}</Button>
          </div>
        </Card>
      </Container>
    );
  }

  const idx = neighbours.indexOf(number);
  const prev = idx > 0 ? neighbours[idx - 1] : null;
  const next = idx >= 0 && idx < neighbours.length - 1 ? neighbours[idx + 1] : null;
  const unlocked = history.some((h) => h.status === "published") || me.role === "admin";
  const tree = ex.referencePgn ? parseSinglePgn(ex.referencePgn) : null;

  return (
    <Container className="py-10">
      <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
        <Link href="/espace" className="hover:text-navy-900">Tableau de bord</Link> ·{" "}
        <Link href={`/espace/modules/${mod.id}`} className="hover:text-navy-900">{mod.name}</Link> · {dossier.label}
      </nav>
      <div className="mt-3">
        <PageHeading eyebrow={`${dossier.label} · n°${ex.indexInDossier}`} title={<span className="flex flex-wrap items-center gap-3">Exercice {fmtNumber(ex.number)} {ex.status === "sample" && <SampleBadge />}</span>}>
          <div className="flex gap-2">
            {prev && <Button href={`/espace/exercices/${prev}`} variant="ghost">← {fmtNumber(prev)}</Button>}
            {next && <Button href={`/espace/exercices/${next}`} variant="ghost">{fmtNumber(next)} →</Button>}
          </div>
        </PageHeading>
      </div>

      {!ex.fen || !tree ? (
        <Card className="mt-8">
          <p className="text-ink">Le contenu de cet exercice sera bientôt disponible en ligne.</p>
        </Card>
      ) : (
        <>
          {ex.prompt && <p className="mt-4 rounded-2xl bg-navy-900 px-5 py-4 text-lg font-medium text-white">{ex.prompt}</p>}
          <Card className="mt-6">
            <AnswerForm exercise={ex.number} startFen={ex.fen} />
          </Card>

          {history.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl text-navy-900">Mes réponses</h2>
              <div className="mt-4 space-y-4">
                {history.map((h, i) => {
                  const lines = answerLines(ex.fen!, h.answerPgn, h.answerText);
                  return (
                    <Card key={h.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Réponse {history.length - i} · <span className="font-normal text-muted">{fmtDate(h.createdAt)}</span>
                        </p>
                        {h.status === "published" ? (
                          <span className="flex items-center gap-2 text-sm text-muted">
                            {GRADE_LEGEND[h.finalGrade as Grade] ?? ""} <GradeBadge grade={h.finalGrade} />
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">En attente de correction</span>
                        )}
                      </div>
                      {lines.length > 0 && (
                        <ul className="mt-3 space-y-1 font-mono text-sm text-navy-900">
                          {lines.map((l, k) => (
                            <li key={k}>{l.map(sanToFrench).join(" ")}</li>
                          ))}
                        </ul>
                      )}
                      {h.answerText && <p className="mt-3 whitespace-pre-line text-sm text-muted">{h.answerText}</p>}
                      {h.status === "published" && h.finalText && (
                        <div className="mt-4 rounded-2xl border-l-4 border-brand-700 bg-brand-100/50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Correction du GMI Darko Anic</p>
                          <p className="mt-2 whitespace-pre-line text-ink">{h.finalText}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="font-serif text-2xl text-navy-900">Solution</h2>
            {unlocked ? (
              <div className="mt-4">
                <PgnViewer tree={tree} title="Solution du GMI Darko Anic" />
              </div>
            ) : (
              <Card className="mt-4">
                <p className="text-sm text-muted">La solution commentée s&apos;affiche ici dès que votre première réponse a été corrigée.</p>
              </Card>
            )}
          </section>
        </>
      )}
    </Container>
  );
}
