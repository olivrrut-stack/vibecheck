import { NextResponse } from "next/server";
import { isGameAnswers } from "@/lib/gameMessages";
import { attachStripeSession, createUnpaidReport } from "@/lib/reports";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTrack } from "@/lib/tracks";
import type { Answers, Diagnosis, GameAnswers, Track } from "@/lib/types";
import { isAnswers, isDiagnosis } from "@/lib/validate";

// Starts the $5 unlock. Requires a logged-in user (their account is their
// library). Creates an unpaid report row, opens a Stripe Checkout session for
// it, and returns the Checkout URL for the client to redirect to. The actual
// fix generation happens after payment, in /api/unlock.
export const runtime = "nodejs";

const MAX_SAFARI_DIFF = 4000;

interface CheckoutRequest {
  answers: Answers | GameAnswers;
  diagnosis: Diagnosis;
  track?: Track;
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

  const track: Track = body?.track === "game" ? "game" : "app";
  const answersOk =
    track === "game" ? isGameAnswers(body?.answers) : isAnswers(body?.answers);
  if (!answersOk || !isDiagnosis(body?.diagnosis)) {
    return NextResponse.json(
      { error: "Missing or malformed answers/diagnosis." },
      { status: 400 }
    );
  }
  const primaryText =
    track === "game"
      ? (body.answers as GameAnswers).originality
      : (body.answers as Answers).safariDiff;
  if ((primaryText ?? "").length > MAX_SAFARI_DIFF) {
    return NextResponse.json(
      { error: "That answer is too long. Please shorten it and try again." },
      { status: 400 }
    );
  }
  // Note: a clean result (no flags) can still buy the report. In that case the
  // deep report is a proactive hardening plan, so we intentionally do not reject
  // an empty risks list here.

  // Surface the two most common deploy misconfigs with a clear message instead
  // of a generic failure, so setup problems are obvious from the UI.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Payments aren't configured yet: the server is missing STRIPE_SECRET_KEY. Add it in Vercel and redeploy.",
      },
      { status: 503 }
    );
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Server isn't fully configured: missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel and redeploy.",
      },
      { status: 503 }
    );
  }

  const cfg = getTrack(track);

  try {
    // Persist the report up front (unpaid) so payment metadata can point at a
    // stable id and the unlock step has the data to generate from. The track is
    // stored in the diagnosis so unlock generates the right (app/game) report.
    const reportId = await createUnpaidReport(user.id, body.answers, {
      ...body.diagnosis,
      track,
    });

    const origin = siteOrigin(req);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Explicitly accept cards so checkout works on a fresh account without
      // first activating payment methods in the Stripe dashboard.
      payment_method_types: ["card"],
      // Inline price so no Stripe Product/Price needs pre-creating.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: cfg.priceCents,
            product_data: {
              name: cfg.productName,
              description: `Deep, ${cfg.noun}-specific fixes for every Apple review guideline you were flagged on.`,
            },
          },
        },
      ],
      // Pre-fill and lock the receipt email to their account.
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { reportId, userId: user.id },
      success_url: `${origin}/unlock?session_id={CHECKOUT_SESSION_ID}&track=${track}`,
      cancel_url: `${origin}${cfg.href}?checkout=cancelled`,
    });

    await attachStripeSession(reportId, session.id);

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[VibeCheck] checkout failed:", err);
    const e = err as { type?: string; code?: string; message?: string };
    const msg = e?.message ?? String(err);
    let reason = "Could not start checkout. Please try again.";
    if (typeof e?.type === "string" && e.type.startsWith("Stripe")) {
      // Stripe redacts the key in its own message, so surfacing it is safe and
      // tells us exactly what's wrong (invalid key, expired key, permissions…).
      reason = `Stripe says: ${msg} [${e.type}${e.code ? ", " + e.code : ""}]`;
    } else if (/supabase|service.?role|relation|permission|jwt|createUnpaidReport/i.test(msg)) {
      reason =
        "Couldn't save your report. Check the Supabase service-role key and that the reports table exists.";
    }
    return NextResponse.json({ error: reason }, { status: 500 });
  }
}
