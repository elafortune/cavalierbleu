"use client";

import { useState } from "react";
import { CONTACT_SUBJECTS, LEVELS } from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-1.5 block w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-700 focus:ring-4 focus:ring-brand-700/10";

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setErrors({});
    setMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      setErrors(json.errors ?? {});
      setMessage(json.error ?? null);
      setStatus("error");
    } catch {
      setMessage("Connexion impossible. Réessayez ou écrivez-nous à desk@cavalierbleu.com.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-emerald-600/20 bg-emerald-50 p-8 text-center" role="status">
        <p className="font-serif text-2xl text-navy-900">Merci, votre message est bien parti !</p>
        <p className="mt-2 text-muted">Nous vous répondons personnellement, en général sous 48 heures.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold text-brand-700 hover:underline">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1 text-xs text-rose-600">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-medium text-navy-900">
        Nom et prénom *
        <input name="name" required autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby="name-error" />
        {err("name")}
      </label>
      <label className="block text-sm font-medium text-navy-900">
        E-mail *
        <input name="email" type="email" required autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby="email-error" />
        {err("email")}
      </label>
      <label className="block text-sm font-medium text-navy-900">
        Téléphone
        <input name="phone" type="tel" autoComplete="tel" className={field} />
      </label>
      <label className="block text-sm font-medium text-navy-900">
        Votre niveau
        <select name="level" defaultValue="" className={field}>
          <option value="">—</option>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy-900 sm:col-span-2">
        Sujet *
        <select name="subject" required defaultValue={defaultSubject ?? ""} className={field} aria-invalid={!!errors.subject} aria-describedby="subject-error">
          <option value="" disabled>
            Choisissez un sujet
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {err("subject")}
      </label>
      <label className="block text-sm font-medium text-navy-900 sm:col-span-2">
        Message *
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Parlez-nous de vous, de votre niveau et de vos objectifs…"
          className={field}
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
        />
        {err("message")}
      </label>
      {/* Champ piège anti-spam, invisible pour les humains */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Vos données servent uniquement à vous répondre. Elles ne sont ni cédées ni utilisées à d&apos;autres fins.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-full bg-navy-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {status === "sending" ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
      {message && (
        <p role="alert" className="text-sm text-rose-600 sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
