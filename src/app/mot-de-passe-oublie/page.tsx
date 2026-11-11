import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/member/AuthForms";
import { AuthShell } from "@/components/member/AuthShell";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Choisir un mot de passe"
      intro="Mot de passe oublié, ou première connexion d'un élève de l'ancien espace : indiquez votre e-mail, nous vous envoyons un lien."
    >
      <ForgotForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/connexion" className="font-medium text-brand-700 hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}
