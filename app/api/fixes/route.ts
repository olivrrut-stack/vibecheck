import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  FixesGenerationError,
  generateFixReport,
} from "@/lib/generateFixes";
import {
  RATE_LIMIT,
  checkRateLimit,
  consumeDailyCap,
  refundDaily,
} from "@/lib/ratelimit";
import { isGameAnswers } from "@/lib/gameMessages";
import type { Answers, Diagnosis, GameAnswers, Track } from "@/lib/types";
import { isAnswers, isDiagnosis } from "@/lib/validate";

// Gated PREVIEW of the paid "deep fixes" call, for testing report quality
// before the Stripe + auth flow exists. The real post-payment generation lives
// in /api/unlock; both share lib/generateFixes. Server side only.
//
// Gated behind ENABLE_FIXES_PREVIEW so it 404s in production and can't be abused
// as a free paid call. Set ENABLE_FIXES_PREVIEW=true locally to test.
export const runtime = "nodejs";
export const maxDuration = 60;

const PREVIEW_ENABLED = process.env.ENABLE_FIXES_PREVIEW === "true";

// Mirrors the diagnosis route's cap so a direct call can't inflate token cost.
const MAX_SAFARI_DIFF = 4000;

interface FixesRequest {
  answers: Answers | GameAnswers;
  diagnosis: Diagnosis;
  track?: Track;
}

export async function POST(req: Request) {
  if (!PREVIEW_ENABLED) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is not configured. Missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let body: FixesRequest;
  try {
    body = (await req.json()) as FixesRequest;
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

  const { answers, diagnosis } = body;
  const primaryText =
    track === "game"
      ? (answers as GameAnswers).originality
      : (answers as Answers).safariDiff;

  if (!primaryText.trim()) {
    return NextResponse.json(
      { error: "Please answer the key question." },
      { status: 400 }
    );
  }
  if (primaryText.length > MAX_SAFARI_DIFF) {
    return NextResponse.json(
      { error: "That answer is too long. Please shorten it and try again." },
      { status: 400 }
    );
  }
  // A clean result (no flags) is allowed: the report becomes a proactive
  // hardening plan instead of fixes for specific flags.

  // One paid Anthropic call per request, so cap how many a single IP can run.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  const rate = await checkRateLimit(ip);
  if (!rate.ok) {
    const mins = Math.max(1, Math.ceil(rate.resetSeconds / 60));
    return NextResponse.json(
      {
        error: `You've hit the limit of ${RATE_LIMIT} requests per hour. Try again in about ${mins} minute${
          mins === 1 ? "" : "s"
        }.`,
      },
      { status: 429, headers: { "Retry-After": String(rate.resetSeconds || 3600) } }
    );
  }

  const day = new Date().toISOString().slice(0, 10);
  const daily = await consumeDailyCap(day);
  if (!daily.ok) {
    await refundDaily(day);
    return NextResponse.json(
      { error: "VibeCheck has hit today's capacity. Please check back tomorrow." },
      { status: 503 }
    );
  }

  try {
    const report = await generateFixReport(answers, diagnosis, track);
    console.log("[VibeCheck] fixes(preview)", {
      backend: rate.backend,
      remaining: rate.remaining,
      usedToday: daily.used,
      riskLevel: diagnosis.riskLevel,
      fixCount: report.fixes.length,
    });
    return NextResponse.json(report);
  } catch (err) {
    if (err instanceof FixesGenerationError) {
      const status = err.code === "refusal" ? 422 : 502;
      console.error("[VibeCheck] fixes(preview) generation:", err.code, err.message);
      return NextResponse.json(
        {
          error:
            err.code === "refusal"
              ? "We couldn't generate fixes for that input."
              : "The fix report didn't finish. Please try again.",
        },
        { status }
      );
    }
    if (err instanceof Anthropic.APIError) {
      await refundDaily(day);
      const status = err.status ?? 502;
      console.error("[VibeCheck] Anthropic API error (fixes preview):", status, err.message);
      return NextResponse.json(
        {
          error:
            status === 429
              ? "We're getting a lot of requests right now. Try again in a moment."
              : "Something went wrong while writing your fixes.",
        },
        { status }
      );
    }
    console.error("[VibeCheck] fixes(preview) failed:", err);
    return NextResponse.json(
      { error: "Something went wrong while writing your fixes." },
      { status: 500 }
    );
  }
}
