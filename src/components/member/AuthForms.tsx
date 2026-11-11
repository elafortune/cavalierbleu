"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const input =
  "mt-1.5 block w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-navy-900";
const submit =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-navy-900 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/espace");

const translate = (msg?: string) => {
  if (!msg) return "Une erreur est survenue. Réessayez.";
  if (/invalid email or password/i.test(msg)) return "E-mail ou mot de passe incorrect.";
  if (/already exists/i.test(msg)) return "Un compte existe déjà avec cet e-mail. Connectez-vous ou réinitialisez votre mot de passe.";
  if (/password too short/i.test(msg)) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (/invalid token|expired/i.test(msg)) return "Ce lien n'est plus valide. Demandez un nouveau lien.";
  return msg;
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "creer" ? "signup" : "login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setPending(true);
    setError(null);
    const res =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(f.get("name") ?? "").trim() || email.split("@")[0] });
    setPending(false);
    if (res.error) return setError(translate(res.error.message));
    router.replace(next);
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-2 rounded-full bg-brand-100 p-1 text-sm font-semibold" role="tablist">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`min-h-10 rounded-full transition ${mode === m ? "bg-white text-navy-900 shadow" : "text-muted hover:text-navy-900"}`}
          >
            {m === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className={label}>
            Prénom et nom
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}
        <label className={label}>
          E-mail
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className={label}>
          Mot de passe
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={input}
          />
        </label>
        {mode === "signup" && (
          <p className="text-xs text-muted">
            Utilisez l&apos;e-mail donné lors de votre achat : vos modules seront automatiquement associés à votre compte.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <button className={submit} disabled={pending}>
          {pending ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>
      {mode === "login" && (
        <p className="mt-4 text-center text-sm">
          <Link href="/mot-de-passe-oublie" className="font-medium text-brand-700 hover:underline">
            Mot de passe oublié ou première connexion ?
          </Link>
        </p>
      )}
    </div>
  );
}

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setPending(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reinitialiser-mot-de-passe" });
    setPending(false);
    setSent(true); // même message que le compte existe ou non (pas de fuite d'information)
  }
  if (sent)
    return (
      <p role="status" className="rounded-xl bg-brand-100 p-4 text-sm text-navy-900">
        Si un compte existe pour cette adresse, vous allez recevoir un e-mail avec un lien pour choisir votre mot de passe
        (valable 24 heures). Pensez à vérifier vos courriers indésirables.
      </p>
    );
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className={label}>
        E-mail
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <button className={submit} disabled={pending}>
        {pending ? "Envoi…" : "Recevoir le lien"}
      </button>
    </form>
  );
}

export function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(params.get("error") ? "Ce lien n'est plus valide. Demandez un nouveau lien." : null);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const a = String(f.get("password") ?? "");
    if (a !== String(f.get("confirm") ?? "")) return setError("Les deux mots de passe ne correspondent pas.");
    if (!token) return setError("Lien incomplet. Demandez un nouveau lien.");
    setPending(true);
    const res = await authClient.resetPassword({ newPassword: a, token });
    setPending(false);
    if (res.error) return setError(translate(res.error.message));
    router.replace("/connexion?reinitialise=1");
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className={label}>
        Nouveau mot de passe
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={input} />
      </label>
      <label className={label}>
        Confirmation
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} />
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}{" "}
          <Link href="/mot-de-passe-oublie" className="font-semibold underline">
            Nouveau lien
          </Link>
        </p>
      )}
      <button className={submit} disabled={pending || !token}>
        {pending ? "Enregistrement…" : "Enregistrer mon mot de passe"}
      </button>
    </form>
  );
}

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.replace("/connexion");
        router.refresh();
      }}
    >
      Se déconnecter
    </button>
  );
}
