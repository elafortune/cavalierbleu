// Authentification des membres (Better Auth) : e-mail + mot de passe, réinitialisation par e-mail.
// Rôles : "student" (par défaut) et "admin" (adresses listées dans ADMIN_EMAILS).
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { sendMail } from "@/lib/email";

const siteUrl = () =>
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_ENV === "production" ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const createAuth = () =>
  betterAuth({
  appName: "Institut Le Cavalier Bleu",
  baseURL: siteUrl(),
  trustedOrigins: [
    siteUrl(),
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
    "https://cavalierbleu.vercel.app",
  ].filter((x): x is string => Boolean(x)),
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60 * 24, // 24 h (sert aussi d'activation pour les comptes migrés)
    sendResetPassword: async ({ user: u, url }) => {
      await sendMail({
        to: u.email,
        subject: "Votre accès à l'espace élève — Institut Le Cavalier Bleu",
        text: [
          `Bonjour ${u.name},`,
          ``,
          `Pour choisir votre mot de passe et accéder à votre espace élève, cliquez sur ce lien (valable 24 heures) :`,
          url,
          ``,
          `Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`,
          ``,
          `Institut Le Cavalier Bleu`,
        ].join("\n"),
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "student", input: false },
      legacyRef: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (u) => {
          const email = u.email.toLowerCase();
          return { data: { ...u, email, role: adminEmails().includes(email) ? "admin" : "student" } };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

// Création paresseuse : le build Vercel passe même sans BETTER_AUTH_SECRET ni base (l'erreur n'apparaît qu'à la première requête).
const g = globalThis as unknown as { __cbAuth?: ReturnType<typeof createAuth> };
export const getAuth = () => g.__cbAuth ?? (g.__cbAuth = createAuth());

export type AuthSession = ReturnType<typeof createAuth>["$Infer"]["Session"];
