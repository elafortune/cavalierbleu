import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/member/AuthForms";
import { AuthShell, FormFallback } from "@/components/member/AuthShell";

export const metadata: Metadata = {
  title: "Connexion à l'espace élève",
  robots: { index: false },
};

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Bienvenue"
      intro="Retrouvez vos modules, vos cours en PDF et vos exercices sur échiquier interactif, corrigés par le GMI Darko Anic."
    >
      <Suspense fallback={<FormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
