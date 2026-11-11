import Link from "next/link";
import { Suspense } from "react";
import { toggleExpertiseAction } from "@/app/admin/actions";
import { GuidelineForm } from "@/components/member/AdminForms";
import { Card, fmtDate, fmtNumber, GradeBadge, PageHeading, PageSkeleton } from "@/components/member/ui";
import { Container } from "@/components/ui";
import { expertiseList } from "@/lib/platform/queries";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Base d'expertise" };

export default function ExpertisePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Expertise />
    </Suspense>
  );
}

async function Expertise() {
  await requireAdmin();
  const rows = await expertiseList();
  const guidelines = rows.filter((r) => r.kind === "guideline");
  const examples = rows.filter((r) => r.kind === "example");
  const edited = examples.filter((e) => e.edited === true).length;
  const withAi = examples.filter((e) => e.edited !== null).length;

  return (
    <Container className="py-10">
      <PageHeading eyebrow="IA" title="Base d'expertise de Darko" />
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Chaque correction publiée devient un exemple ; les consignes s&apos;appliquent aux corrections futures. L&apos;IA reçoit, pour chaque
        réponse, les consignes concernées et les exemples les plus proches (même exercice, puis même thème). Ces données sont aussi le jeu
        d&apos;entraînement d&apos;un futur affinage du modèle.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Exemples", examples.length],
          ["Consignes", guidelines.length],
          ["Brouillons IA relus", withAi],
          ["Brouillons modifiés", withAi ? `${edited} (${Math.round((edited / withAi) * 100)} %)` : "—"],
        ].map(([l, v]) => (
          <Card key={l as string} className="!p-4">
            <p className="font-serif text-2xl text-navy-900">{v}</p>
            <p className="text-xs text-muted">{l}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-serif text-lg text-navy-900">Nouvelle consigne</h2>
        <div className="mt-3">
          <GuidelineForm />
        </div>
      </Card>

      <h2 className="mt-10 font-serif text-2xl text-navy-900">Consignes</h2>
      <div className="mt-4 space-y-2">
        {guidelines.map((g) => (
          <Card key={g.id} className={`!p-4 ${g.active ? "" : "opacity-50"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted">
                  {g.scope === "global" ? "Toutes les corrections" : g.scope === "theme" ? `Thème : ${g.theme}` : `Exercice ${fmtNumber(g.exerciseNumber ?? 0)}`} ·{" "}
                  {fmtDate(g.createdAt)}
                </p>
                <p className="mt-1 text-ink">{g.text}</p>
              </div>
              <form action={toggleExpertiseAction}>
                <input type="hidden" name="id" value={g.id} />
                <button className="rounded-full border border-navy-900/15 px-3 py-1 text-xs hover:bg-brand-100">{g.active ? "Désactiver" : "Réactiver"}</button>
              </form>
            </div>
          </Card>
        ))}
        {guidelines.length === 0 && <p className="text-sm text-muted">Aucune consigne pour l&apos;instant.</p>}
      </div>

      <h2 className="mt-10 font-serif text-2xl text-navy-900">Exemples (corrections publiées)</h2>
      <div className="mt-4 space-y-2">
        {examples.map((e) => (
          <Card key={e.id} className={`!p-4 ${e.active ? "" : "opacity-50"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-xs text-muted">
                  <GradeBadge grade={e.grade} />
                  {e.exerciseNumber && (
                    <Link href={`/admin/exercices/${e.exerciseNumber}`} className="font-mono hover:text-navy-900">
                      {fmtNumber(e.exerciseNumber)}
                    </Link>
                  )}
                  · {fmtDate(e.createdAt)} {e.edited === true && "· brouillon IA modifié"} {e.edited === false && "· brouillon IA validé tel quel"}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{e.studentAnswer}</p>
                <p className="mt-1 line-clamp-3 text-sm text-ink">{e.text}</p>
              </div>
              <form action={toggleExpertiseAction}>
                <input type="hidden" name="id" value={e.id} />
                <button className="rounded-full border border-navy-900/15 px-3 py-1 text-xs hover:bg-brand-100">{e.active ? "Exclure" : "Réintégrer"}</button>
              </form>
            </div>
          </Card>
        ))}
        {examples.length === 0 && <p className="text-sm text-muted">Les exemples apparaîtront à mesure que les corrections sont publiées.</p>}
      </div>
    </Container>
  );
}
