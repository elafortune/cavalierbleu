// Développement local : crée un compte administrateur et un compte élève de test
// (identifiants lus dans .env.local : DEV_ADMIN_EMAIL/PASSWORD, DEV_STUDENT_EMAIL/PASSWORD)
// et ouvre le Module Vert à l'élève. Ne jamais utiliser en production.
import { loadEnv } from "./env";
loadEnv();

async function main() {
  if (process.env.DATABASE_URL) throw new Error("Refusé : DATABASE_URL est défini (base distante).");
  const auth = (await import("../src/lib/auth")).getAuth();
  const { grantModules } = await import("../src/lib/platform/access");
  const accounts = [
    { email: process.env.DEV_ADMIN_EMAIL, password: process.env.DEV_ADMIN_PASSWORD, name: "Admin Test" },
    { email: process.env.DEV_STUDENT_EMAIL, password: process.env.DEV_STUDENT_PASSWORD, name: "Élève Test" },
  ];
  for (const a of accounts) {
    if (!a.email || !a.password) continue;
    try {
      await auth.api.signUpEmail({ body: { email: a.email, password: a.password, name: a.name } });
      console.log(`Compte créé : ${a.email}`);
    } catch (e) {
      console.log(`Compte ${a.email} : ${(e as Error).message}`);
    }
  }
  if (process.env.DEV_STUDENT_EMAIL) {
    await grantModules(process.env.DEV_STUDENT_EMAIL, ["vert", "jaune"], "admin", "dev-accounts");
    console.log("Modules Vert et Jaune ouverts à l'élève de test.");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
