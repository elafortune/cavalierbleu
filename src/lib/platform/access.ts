// Droits d'accès aux modules. Rattachés à l'e-mail : un achat fait avant la création du compte
// est retrouvé automatiquement à la première connexion.
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { entitlements, modules } from "@/db/schema";

/** Modules ouverts par chaque produit du catalogue (src/lib/catalog.ts). */
export function modulesOfProduct(productId: string): string[] {
  const m = /^module-([a-z]+)$/.exec(productId);
  if (m) return [m[1]];
  const bundles: Record<string, string[]> = {
    "elan-vert-azur": ["vert", "azur"],
    "elan-azur-turquoise": ["azur", "turquoise"],
    "elan-vert-coaching": ["vert"],
    "elan-azur-coaching": ["azur"],
  };
  return bundles[productId] ?? [];
}

export async function grantModules(email: string, moduleIds: string[], source: "stripe" | "admin" | "legacy", reference?: string) {
  const e = email.trim().toLowerCase();
  if (!e || !moduleIds.length) return 0;
  const rows = await db
    .insert(entitlements)
    .values(moduleIds.map((moduleId) => ({ email: e, moduleId, source, reference })))
    .onConflictDoNothing()
    .returning({ id: entitlements.id });
  return rows.length;
}

export async function revokeModule(email: string, moduleId: string) {
  await db.delete(entitlements).where(and(eq(entitlements.email, email.toLowerCase()), eq(entitlements.moduleId, moduleId)));
}

export async function accessibleModuleIds(email: string, isAdmin = false): Promise<string[]> {
  if (isAdmin) return (await db.select({ id: modules.id }).from(modules)).map((r) => r.id);
  const rows = await db.select({ id: entitlements.moduleId }).from(entitlements).where(eq(entitlements.email, email.toLowerCase()));
  return rows.map((r) => r.id);
}

export async function hasModuleAccess(email: string, moduleId: string, isAdmin = false) {
  if (isAdmin) return true;
  const [row] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.email, email.toLowerCase()), eq(entitlements.moduleId, moduleId)));
  return Boolean(row);
}

export async function listModules(ids?: string[]) {
  const q = db.select().from(modules).orderBy(asc(modules.position));
  return ids ? (ids.length ? q.where(inArray(modules.id, ids)) : []) : q;
}
