import { hasModuleAccess } from "@/lib/platform/access";
import { courseDocument } from "@/lib/platform/queries";
import { getCurrentUser } from "@/lib/session";
import { getFile } from "@/lib/storage";

// Sert un cours PDF uniquement aux élèves qui ont accès au module (le fichier n'a pas d'URL publique).
export async function GET(_req: Request, ctx: RouteContext<"/espace/cours/[id]">) {
  const { id } = await ctx.params;
  const me = await getCurrentUser();
  if (!me) return Response.redirect(new URL(`/connexion?next=/espace`, _req.url), 303);
  const doc = await courseDocument(Number(id));
  if (!doc || !(await hasModuleAccess(me.email, doc.moduleId, me.role === "admin"))) {
    return new Response("Document introuvable", { status: 404 });
  }
  const file = await getFile(doc.storageKey);
  if (!file) return new Response("Fichier manquant", { status: 404 });
  const body: BodyInit = file.body instanceof ReadableStream ? file.body : new Uint8Array(file.body);
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
