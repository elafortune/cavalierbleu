"use client";

import { useState } from "react";

type Props = {
  productId: string;
  label?: string;
  variant?: "dark" | "light" | "outline";
  className?: string;
};

export function BuyButton({ productId, label = "Payer en ligne", variant = "dark", className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = {
    dark: "bg-navy-900 text-white hover:bg-brand-700",
    light: "bg-cyan-accent text-navy-950 hover:bg-white",
    outline: "border border-navy-900/20 text-navy-900 hover:border-navy-900 hover:bg-white",
  }[variant];

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "Une erreur est survenue.");
    } catch {
      setError("Connexion impossible. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${styles}`}
      >
        {loading ? (
          "Redirection…"
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs leading-snug text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
