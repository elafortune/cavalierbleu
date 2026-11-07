import { getProduct } from "@/lib/catalog";
import { getStripe } from "@/lib/stripe";

// Crée une session Stripe Checkout pour un produit du catalogue.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Le paiement en ligne n'est pas encore activé. Contactez-nous à desk@cavalierbleu.com." },
      { status: 503 },
    );
  }

  let productId: unknown;
  try {
    ({ productId } = await request.json());
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const product = typeof productId === "string" ? getProduct(productId) : undefined;
  if (!product) return Response.json({ error: "Produit inconnu." }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: product.amount,
            product_data: { name: product.name, description: product.description },
          },
        },
      ],
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      invoice_creation: { enabled: true },
      allow_promotion_codes: true,
      ...(product.shipping
        ? { shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "MC", "CA", "GP", "MQ", "RE", "GF", "YT"] } }
        : {}),
      metadata: { productId: product.id },
      success_url: `${origin}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement/annule`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] erreur Stripe", err);
    return Response.json({ error: "Impossible de créer le paiement. Réessayez ou contactez-nous." }, { status: 502 });
  }
}
