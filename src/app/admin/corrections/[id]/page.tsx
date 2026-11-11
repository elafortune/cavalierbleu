import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { draftAction } from "@/app/admin/actions";
import { PgnViewer } from "@/components/chess/PgnViewer";
import { ReviewForm } from "@/components/member/ReviewForm";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton, SampleBadge } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { getLlmProvider } from "@/lib/ai/provider";
import type { AutoCheck } from "@/lib/chess/check";
import { sanToFrench } from "@/lib/chess/french";
import { parseSinglePgn } from "@/lib/chess/pgn";
import { answerLines, previewPrompt } from "@/lib/platform/corrections";
import { correctionDetail, reviewQueue } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export default function ReviewPage({ params }: PageProps<"/admin/corrections/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Review params={params} />
    </Suspense>
  );
}

const VERDICT: Record<string, string> = { best: "✓ meilleur coup", good: "✓ acceptable", mistake: "✗ erreur", defense: "défense prévue", unknown: "? hors référence" };

async function Review({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const d = await correctionDetail(id);
  if (!d) notFound();
  const { c, a, ex, u, templates, previous } = d;
  const auto = c.autoCheck as AutoCheck | null;
  const lines = ex.fen ? answerLines(ex.fen, a.answerPgn, a.answerText) : [];
  const queue = await reviewQueue();
  const nextId = queue.find((q) => q.id !== id)?.id ?? null;
  const prompt = await previewPrompt(id);
  const ai = getLlmProvider();
  let answerTree = null;
  try {
    answerTree = a.answerPgn ? parseSinglePgn(a.answerPgn) : null;
  } catch {
    answerTree = null;
  }

  return (
    <Container className="py-10">
      <Link href="/admin/corrections" className="text-sm text-muted hover:text-navy-900">← File de corrections</Link>
      <div className="mt-3">
        <PageHeading
          eyebrow={`${u.name} · ${u.email}`}
          title={<span className="flex flex-wrap items-center gap-3">Exercice {fmtNumber(ex.number)} {ex.status === "sample" && <SampleBadge />}</span>}
        >
          <p className="text-sm text-muted">Reçue le {fmtDate(a.createdAt)}</p>
        </PageHeading>
      </div>
      {ex.prompt && <p className="mt-4 text-ink">{ex.prompt}</p>}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-serif text-xl text-navy-900">Réponse de l&apos;élève</h2>
          {lines.length > 0 ? (
            <ul className="mt-3 space-y-1 font-mono text-sm">
              {lines.map((l, i) => (
                <li key={i}>{l.map(sanToFrench).join(" ")}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Aucun coup lisible.</p>
          )}
          {a.answerText && <p className="mt-4 whitespace-pre-line rounded-xl bg-cream-200/60 p-4 text-sm text-ink">{a.answerText}</p>}
          {previous.length > 0 && (
            <p className="mt-4 text-xs text-muted">
              Réponses précédentes à cet exercice : {previous.map((p) => `${fmtDate(p.createdAt)} (${p.grade ?? "non corrigée"})`).join(" · ")}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-navy-900">Vérification automatique</h2>
            <GradeBadge grade={auto?.suggestedGrade} title="Note suggérée" />
          </div>
          {auto ? (
            <>
              <p className="mt-3 text-sm text-ink">{auto.summary}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {auto.lines.map((l, i) => (
                  <li key={i} className="rounded-xl border border-navy-900/10 p-3">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono">
                      {l.steps.map((s, k) => (
                        <span
                          key={k}
                          title={VERDICT[s.verdict]}
                          className={
                            s.verdict === "mistake" ? "text-red-700 underline decoration-wavy" : s.verdict === "unknown" ? "text-amber-700" : s.verdict === "best" ? "font-bold text-emerald-700" : "text-navy-900"
                          }
                        >
                          {sanToFrench(s.san)}
                        </span>
                      ))}
                    </div>
                    {l.refutation && <p className="mt-1 text-xs text-muted">Réfutation : {l.refutation.map(sanToFrench).join(" ")}</p>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                <span className="font-bold text-emerald-700">gras vert</span> = suite principale · <span className="text-red-700">rouge</span> = erreur
                signalée dans la référence · <span className="text-amber-700">orange</span> = hors de la référence (à juger)
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Indisponible.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-navy-900">Brouillon de l&apos;IA</h2>
          {ai ? (
            <form action={draftAction}>
              <input type="hidden" name="correctionId" value={id} />
              <button className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-medium hover:bg-brand-100">
                {c.aiText ? "Régénérer le brouillon" : "Générer le brouillon"}
              </button>
            </form>
          ) : (
            <span className="text-xs text-muted">IA non configurée (clé Gemini à ajouter)</span>
          )}
        </div>
        {c.aiText ? (
          <p className="mt-3 whitespace-pre-line text-sm text-ink">
            <GradeBadge grade={c.aiGrade} /> {c.aiText}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">{c.aiError ? `Erreur : ${c.aiError}` : "Pas encore de brouillon."}</p>
        )}
        {prompt && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-brand-700">Voir les instructions envoyées à l&apos;IA</summary>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-navy-950 p-4 text-xs text-white/80">{prompt}</pre>
          </details>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-serif text-xl text-navy-900">Votre correction</h2>
        <div className="mt-4">
          <ReviewForm
            correctionId={id}
            initialGrade={c.aiGrade ?? c.suggestedGrade}
            initialText={c.aiText ?? ""}
            templates={templates.map((t) => ({ label: t.label, body: t.body }))}
            themes={ex.themes}
            nextId={nextId}
          />
        </div>
      </Card>

      <div className="mt-10 grid grid-cols-1 gap-10">
        {answerTree && answerTree.rootChildren.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl text-navy-900">Réponse jouée par l&apos;élève</h2>
            <div className="mt-4">
              <PgnViewer tree={answerTree} title="Réponse de l'élève" keyboard={false} />
            </div>
          </section>
        )}
        {ex.referencePgn && (
          <section>
            <h2 className="font-serif text-2xl text-navy-900">Solution de référence</h2>
            <div className="mt-4">
              <PgnViewer tree={parseSinglePgn(ex.referencePgn)} title="Solution" />
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
