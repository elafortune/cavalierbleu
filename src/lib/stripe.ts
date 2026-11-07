import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Renvoie le client Stripe, ou null si STRIPE_SECRET_KEY n'est pas définie. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
