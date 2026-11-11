
// Envoi d'e-mails via l'API HTTP de Resend (https://resend.com) — aucune dépendance supplémentaire.
// Variables d'environnement : RESEND_API_KEY, CONTACT_TO, CONTACT_FROM.

type Mail = { subject: string; text: string; replyTo?: string; /** Destinataire (par défaut : l'Institut, CONTACT_TO). */ to?: string };

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export async function sendMail({ subject, text, replyTo, to: recipient }: Mail): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = recipient || process.env.CONTACT_TO || "desk@cavalierbleu.com";
  const from = process.env.CONTACT_FROM || "Site Cavalier Bleu <onboarding@resend.dev>";

  if (!key) {
    // En développement sans clé : on journalise au lieu d'envoyer.
    console.info(`[email:dev] À: ${to}\nSujet: ${subject}\n\n${text}`);
    return process.env.NODE_ENV === "production" ? { ok: false, error: "not-configured" } : { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
  });
  if (!res.ok) {
    console.error("[email] échec Resend", res.status, await res.text().catch(() => ""));
    return { ok: false, error: "send-failed" };
  }
  return { ok: true };
}
