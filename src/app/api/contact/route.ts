import { CONTACT_SUBJECTS as SUBJECTS } from "@/lib/contact";
import { sendMail } from "@/lib/email";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Champ piège anti-spam : rempli uniquement par les robots.
  if (clean(body.website, 200)) return Response.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const subject = clean(body.subject, 80);
  const level = clean(body.level, 80);
  const message = clean(body.message, 5000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Indiquez votre nom.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Adresse e-mail invalide.";
  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) errors.subject = "Choisissez un sujet.";
  if (message.length < 10) errors.message = "Votre message est un peu court.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const result = await sendMail({
    subject: `[Site] ${subject} — ${name}`,
    replyTo: email,
    text: [
      `Nom : ${name}`,
      `E-mail : ${email}`,
      phone && `Téléphone : ${phone}`,
      level && `Niveau : ${level}`,
      `Sujet : ${subject}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (!result.ok) {
    return Response.json(
      { error: "L'envoi a échoué. Écrivez-nous directement à desk@cavalierbleu.com." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
