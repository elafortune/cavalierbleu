import type Stripe from "stripe";
import { formatPrice, getProduct } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { grantModules, modulesOfProduct } from "@/lib/platform/access";
import { getStripe } from "@/lib/stripe";

// Webhook Stripe : prévient l'Institut par e-mail à chaque paiement réussi
// (pour envoyer le module, planifier les cours, expédier les fiches…).
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Webhook non configuré", { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch (err) {
    console.error("[webhook] signature invalide", err);
    return new Response("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const product = getProduct(s.metadata?.productId ?? "");
    const d = s.customer_details;
    const ship = s.collected_information?.shipping_details;
    // Ouverture automatique des modules achetés dans l'espace élève (rattachés à l'e-mail du client).
    const moduleIds = modulesOfProduct(s.metadata?.productId ?? "");
    let granted = 0;
    if (moduleIds.length && d?.email) {
      try {
        granted = await grantModules(d.email, moduleIds, "stripe", s.id);
      } catch (err) {
        console.error("[webhook] ouverture des modules impossible", err);
        return new Response("Erreur d'enregistrement", { status: 500 }); // Stripe réessaiera
      }
    }
    const lines = [
      `Nouvelle commande payée sur le site.`,
      ``,
      `Produit : ${product?.name ?? s.metadata?.productId}`,
      `Montant : ${s.amount_total != null ? formatPrice(s.amount_total) : "?"}`,
      ``,
      `Client : ${d?.name ?? ""}`,
      `E-mail : ${d?.email ?? ""}`,
      `Téléphone : ${d?.phone ?? ""}`,
      ship ? `Livraison : ${ship.name}, ${[ship.address.line1, ship.address.line2, ship.address.postal_code, ship.address.city, ship.address.country].filter(Boolean).join(", ")}` : "",
      ``,
      moduleIds.length ? `Espace élève : ${granted ? `accès ouvert (${moduleIds.join(", ")})` : "accès déjà existant"}` : "",
      `Session Stripe : ${s.id}`,
    ];
    await sendMail({
      subject: `Commande : ${product?.name ?? "produit"} — ${d?.name ?? d?.email ?? ""}`,
      text: lines.filter((l) => l !== undefined).join("\n"),
      replyTo: d?.email ?? undefined,
    });
  }

  return Response.json({ received: true });
}
