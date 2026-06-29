import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { FixesGenerationError, generateFixReport } from "@/lib/generateFixes";
import {
  getReportById,
  markReportPaid,
  saveReportFixes,
} from "@/lib/reports";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Completes the $5 unlock after the user returns from Stripe Checkout. Verifies
// the session was actually paid, then generates and saves the deep fix report.
//
// Idempotent + retry-safe by design: payment is recorded BEFORE the slow AI
// call, so if generation times out or errors, the row stays paid with null
// fixes and simply reloading this endpoint regenerates them. The buyer can
// never pay and be left with nothing.
export const runtime = "nodejs";
export const maxDuration = 60;

interface UnlockRequest {
  sessionId: string;
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: UnlockRequest;
  try {
    body = (await req.json()) as UnlockRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body?.sessionId || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "Missing session id." }, { status: 400 });
  }

  // Verify the payment with Stripe (never trust the client that it was paid).
  let reportId: string | undefined;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment is not complete." },
        { status: 402 }
      );
    }
    // The session must belong to this user, and carry its report id.
    if (session.metadata?.userId && session.metadata.userId !== user.id) {
      return NextResponse.json({ error: "Not your purchase." }, { status: 403 });
    }
    reportId = session.metadata?.reportId;
  } catch (err) {
    console.error("[VibeCheck] stripe verify failed:", err);
    return NextResponse.json(
      { error: "Could not verify payment. Please try again." },
      { status: 502 }
    );
  }

  if (!reportId) {
    return NextResponse.json(
      { error: "This checkout session has no report attached." },
      { status: 400 }
    );
  }

  const report = await getReportById(reportId);
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.user_id !== user.id) {
    return NextResponse.json({ error: "Not your report." }, { status: 403 });
  }

  // Already generated: return it, no second paid call.
  if (report.fixes) {
    return NextResponse.json({ report });
  }

  // Record payment first so a generation failure never costs the buyer access.
  await markReportPaid(reportId);

  try {
    const fixes = await generateFixReport(
      report.answers,
      report.diagnosis,
      report.diagnosis.track ?? "app"
    );
    await saveReportFixes(reportId, fixes);
    const updated = await getReportById(reportId);
    return NextResponse.json({ report: updated ?? { ...report, fixes, paid: true } });
  } catch (err) {
    // Payment is already recorded; the row stays paid with null fixes, so the
    // client can retry and this regenerates. Surface a retryable error.
    if (err instanceof FixesGenerationError || err instanceof Anthropic.APIError) {
      console.error("[VibeCheck] unlock generation failed (retryable):", err);
      return NextResponse.json(
        {
          error:
            "Your purchase went through, but writing the fixes timed out. Please reload to finish, no charge.",
          retryable: true,
        },
        { status: 502 }
      );
    }
    console.error("[VibeCheck] unlock failed:", err);
    return NextResponse.json(
      { error: "Something went wrong finishing your report." },
      { status: 500 }
    );
  }
}
