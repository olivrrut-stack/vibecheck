import { NextResponse } from "next/server";
import { attachStripeSession, createUnpaidReport } from "@/lib/reports";
import { FIX_REPORT_PRICE_CENTS, getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Answers, Diagnosis } from "@/lib/types";
import { isAnswers, isDiagnosis } from "@/lib/validate";

// Starts the $5 unlock. Requires a logged-in user (their account is their
// library). Creates an unpaid report row, opens a Stripe Checkout session for
// it, and returns the Checkout URL for the client to redirect to. The actual
// fix generation happens after payment, in /api/unlock.
export const runtime = "nodejs";

const MAX_SAFARI_DIFF = 4000;

interface CheckoutRequest {
  answers: Answers;
  diagnosis: Diagnosis;
}

function siteOrigin(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Fall back to the request origin (handles local dev + preview URLs).
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  // Must be signed in: the report is saved to this user's library.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to unlock your fixes." },
      { status: 401 }
    );
  }

  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isAnswers(body?.answers) || !isDiagnosis(body?.diagnosis)) {
    return NextResponse.json(
      { error: "Missing or malformed answers/diagnosis." },
      { status: 400 }
    );
  }
  if (body.answers.safariDiff.length > MAX_SAFARI_DIFF) {
    return NextResponse.json(
      { error: "That answer is too long. Please shorten it and try again." },
      { status: 400 }
    );
  }
  if (body.diagnosis.risks.length === 0) {
    return NextResponse.json(
      { error: "There are no flagged guidelines to write fixes for." },
      { status: 422 }
    );
  }

  try {
    // Persist the report up front (unpaid) so payment metadata can point at a
    // stable id and the unlock step has the data to generate from.
    const reportId = await createUnpaidReport(
      user.id,
      body.answers,
      body.diagnosis
    );

    const origin = siteOrigin(req);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Inline price so no Stripe Product/Price needs pre-creating.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: FIX_REPORT_PRICE_CENTS,
            product_data: {
              name: "VibeCheck Fix Report",
              description:
                "Deep, app-specific fixes for every App Store guideline you were flagged on.",
            },
          },
        },
      ],
      // Pre-fill and lock the receipt email to their account.
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { reportId, userId: user.id },
      success_url: `${origin}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    await attachStripeSession(reportId, session.id);

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[VibeCheck] checkout failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
