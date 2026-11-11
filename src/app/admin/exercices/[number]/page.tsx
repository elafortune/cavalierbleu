import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { PgnViewer } from "@/components/chess/PgnViewer";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton, SampleBadge } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { db } from "@/db";
import { correctionTemplates, exercises } from "@/db/schema";
import { checkAnswer, type Grade } from "@/lib/chess/check";
import { extractLinesFromText, sanToFrench } from "@/lib/chess/french";
import { parseSinglePgn } from "@/lib/chess/pgn";
import { legacyAnswersFor } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export default function ExerciseAdminPage({ params }: PageProps<"/admin/exercices/[number]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExerciseAdmin params={params} />
    </Suspense>
  );
}

async function ExerciseAdmin({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const n = Number((await params).number);
  const [ex] = await db.select().from(exercises).where(eq(exercises.number, n));
  if (!ex) notFound();
  const templates = await db.select().from(correctionTemplates).where(eq(correctionTemplates.exerciseNumber, n)).orderBy(correctionTemplates.label);
  const legacy = await legacyAnswersFor(n);
  const tree = ex.referencePgn ? parseSinglePgn(ex.referencePgn) : null;

  // Banc d'essai : la vérification automatique appliquée aux réponses historiques de l'ancien site.
  const evaluated = tree && ex.fen ? legacy.map((l) => ({ ...l, check: checkAnswer(tree, extractLinesFromText(ex.fen!, l.text)) })) : [];
  const dist = evaluated.reduce<Record<string, number>>((acc, e) => ((acc[e.check.suggestedGrade] = (acc[e.check.suggestedGrade] ?? 0) + 1), acc), {});

  return (
    <Container className="py-10">
      <Link href="/admin/contenus" className="text-sm text-muted hover:text-navy-900">← Contenus</Link>
      <div className="mt-3">
        <PageHeading
          eyebrow={`${ex.moduleId} · source : ${ex.source ?? "—"}`}
          title={<span className="flex flex-wrap items-center gap-3">Exercice {fmtNumber(n)} {ex.status === "sample" && <SampleBadge />}</span>}
        />
      </div>
      {ex.prompt && <p className="mt-3 text-ink">{ex.prompt}</p>}
      {ex.themes.length > 0 && <p className="mt-1 text-sm text-muted">Thèmes : {ex.themes.join(", ")}</p>}

      {tree ? (
        <div className="mt-6">
          <PgnViewer tree={tree} title="Solution de référence" />
        </div>
      ) : (
        <Card className="mt-6">Pas encore de contenu pour cet exercice.</Card>
      )}

      <Card className="mt-8">
        <h2 className="font-serif text-xl text-navy-900">Corrections types ({templates.length})</h2>
        <div className="mt-4 space-y-4">
          {templates.map((t) => (
            <div key={t.id}>
              <p className="font-semibold text-brand-700">{t.label})</p>
              <p className="whitespace-pre-line text-sm text-ink">{t.body}</p>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-muted">Aucune.</p>}
        </div>
      </Card>

      {evaluated.length > 0 && (
        <Card className="mt-8 !p-0">
          <div className="p-5 sm:p-6">
            <h2 className="font-serif text-xl text-navy-900">Banc d&apos;essai : {evaluated.length} réponses historiques</h2>
            <p className="mt-1 text-sm text-muted">
              Note proposée par la vérification automatique pour chaque réponse de l&apos;ancien site (texte libre). Sert à mesurer et régler la
              correction avant de l&apos;ouvrir aux élèves.
            </p>
            <p className="mt-3 flex flex-wrap gap-3 text-sm">
              {(["+", "?", "!?", "?!", "-"] as Grade[]).map((g) => (
                <span key={g} className="flex items-center gap-1">
                  <GradeBadge grade={g} /> {dist[g] ?? 0}
                </span>
              ))}
            </p>
          </div>
          <div className="max-h-[600px] overflow-auto border-t border-navy-900/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <tbody className="divide-y divide-navy-900/10">
                {evaluated.map((e) => (
                  <tr key={e.id} className="align-top">
                    <td className="w-14 px-4 py-3">
                      <GradeBadge grade={e.check.suggestedGrade} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-pre-line text-ink">{e.text.length > 400 ? `${e.text.slice(0, 400)}…` : e.text}</p>
                      <p className="mt-1 font-mono text-xs text-brand-700">
                        {e.check.lines.map((l) => l.moves.map(sanToFrench).join(" ")).join(" | ") || "aucun coup lu"}
                      </p>
                      <p className="mt-1 text-xs text-muted">{e.check.summary}</p>
                    </td>
                    <td className="w-32 px-4 py-3 text-xs text-muted">{fmtDate(e.answeredAt)}</td>
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
