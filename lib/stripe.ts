import "server-only";
import Stripe from "stripe";

// Server-only Stripe client. The secret key (sk_test_… or sk_live_…) stays on
// the server; the browser only ever sees the Checkout URL we redirect to.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY).");
  }
  // No apiVersion pin: the SDK uses the account's default API version.
  return new Stripe(key);
}

/** The price of one unlocked fix report, in cents. */
export const FIX_REPORT_PRICE_CENTS = 500;
