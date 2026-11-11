// Stockage des fichiers privés (cours PDF).
// - Production : Vercel Blob en accès privé (BLOB_READ_WRITE_TOKEN). Les fichiers ne sont jamais exposés
//   directement : ils sont servis par /espace/cours/[id] après vérification des droits de l'élève.
// - Développement sans jeton : disque local (.data/storage).
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_DIR = path.join(process.cwd(), ".data", "storage");
export const usingBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const safeKey = (key: string) => {
  const k = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (k.split("/").some((p) => p === ".." || p === "")) throw new Error(`Clé de stockage invalide : ${key}`);
  return k;
};

export async function putFile(key: string, data: Buffer, contentType: string): Promise<void> {
  const k = safeKey(key);
  if (usingBlob()) {
    const { put } = await import("@vercel/blob");
    await put(k, data, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true });
    return;
  }
  const file = path.join(LOCAL_DIR, k);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

/** Renvoie un flux du fichier (ou null s'il n'existe pas). */
export async function getFile(key: string): Promise<{ body: ReadableStream | Buffer; size?: number } | null> {
  const k = safeKey(key);
  if (usingBlob()) {
    const { get } = await import("@vercel/blob");
    const r = await get(k, { access: "private" });
    if (!r || r.statusCode !== 200) return null;
    return { body: r.stream, size: r.blob.size };
  }
  const file = path.join(LOCAL_DIR, k);
  try {
    const s = await stat(file);
    return { body: await readFile(file), size: s.size };
  } catch {
    return null;
  }
}
