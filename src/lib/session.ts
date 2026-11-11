import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

// Couche d'accès à la session : à appeler dans un composant serveur placé sous <Suspense>
// (Cache Components), dans une Server Action ou un Route Handler — jamais faire confiance au client.

export type CurrentUser = { id: string; name: string; email: string; role: "student" | "admin" };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const s = await getAuth().api.getSession({ headers: await headers() });
  if (!s) return null;
  const u = s.user as typeof s.user & { role?: string };
  return { id: u.id, name: u.name, email: u.email.toLowerCase(), role: u.role === "admin" ? "admin" : "student" };
}

export async function requireUser(next = "/espace"): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const u = await requireUser("/admin");
  if (u.role !== "admin") notFound(); // on ne révèle pas l'existence de l'administration
  return u;
}
