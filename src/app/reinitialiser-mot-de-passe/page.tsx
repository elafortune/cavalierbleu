import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "@/components/member/AuthForms";
import { AuthShell, FormFallback } from "@/components/member/AuthShell";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPage() {
  return (
    <AuthShell title="Nouveau mot de passe" intro="Au moins 8 caractères.">
      <Suspense fallback={<FormFallback />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
