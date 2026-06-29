"use client";

import Link from "next/link";
import { useState } from "react";
import type { Answers, Diagnosis } from "@/lib/types";
import AuthForm from "./auth/AuthForm";
import { useAuth } from "./auth/AuthProvider";

// The $5 upsell on the result and its inline purchase flow:
//   cta  ->  (account step if logged out)  ->  optional context  ->  Stripe
// Payment + fix generation happen server-side (/api/checkout, /api/unlock); this
// component only collects intent, the account, and any extra context.

type Step = "cta" | "auth" | "context" | "redirecting";

// What's in the report, worded for whichever case the result is in.
const INCLUDES_FLAGGED = [
  "The root cause of each flag, tied to your answers",
  "Exactly what to change, step by step",
  "A worked example built for your app's category",
  "What the reviewer needs to see to approve",
  "Paste-ready App Review notes to pre-clear it",
];
const INCLUDES_CLEAN = [
  "The guidelines a reviewer will still scrutinize for an app like yours",
  "Exactly what to tighten to push your risk toward zero",
  "A worked example built for your app's category",
  "What the reviewer needs to see to approve on the first try",
  "Paste-ready App Review notes to pre-clear your submission",
];

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect
        x="4.5"
        y="10.5"
        width="15"
        height="10"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function UnlockPanel({
  diagnosis,
  answers,
}: {
  diagnosis: Diagnosis;
  answers: Answers;
}) {
  const { user, loading, ready } = useAuth();
  const [step, setStep] = useState<Step>("cta");
  const [extra, setExtra] = useState("");
  const [error, setError] = useState<string | null>(null);

  const q2Short = answers.safariDiff.trim().length < 40;
  const hasFlags = diagnosis.risks.length > 0;
  const includes = hasFlags ? INCLUDES_FLAGGED : INCLUDES_CLEAN;
  const heading = hasFlags
    ? "Get the exact fixes, written for your app"
    : "Lock in your approval and drive the risk to zero";
  const subhead = hasFlags
    ? "The free notes tell you what’s wrong. This tells you precisely how to fix every flag and get approved."
    : "You’re already low risk. This gives you the exact steps to make approval bulletproof and close the last gaps before you submit.";

  // Begin: logged-in users go straight to the optional context step; logged-out
  // users make an account first.
  function begin() {
    setError(null);
    setStep(user ? "context" : "auth");
  }

  async function startCheckout() {
    setError(null);
    setStep("redirecting");

    // Fold any extra context into Q2 so the existing generator picks it up.
    const merged: Answers = extra.trim()
      ? {
          ...answers,
          safariDiff: `${answers.safariDiff.trim()}\n\nMore about the app: ${extra.trim()}`,
        }
      : answers;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: merged, diagnosis }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object" || !("url" in data)) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Could not start checkout. Please try again.";
        setError(msg);
        setStep("context");
        return;
      }
      window.location.href = String((data as { url: string }).url);
    } catch {
      setError("Could not reach the server. Please try again.");
      setStep("context");
    }
  }

  return (
    <section className="vc-rise overflow-hidden rounded-[var(--radius-card)] border border-accent/30 bg-surface shadow-card ring-1 ring-accent/10">
      <div className="border-b border-line bg-accent/[0.04] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-accent">
          <LockGlyph />
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            {hasFlags ? "Full fix report" : "Full approval report"}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">
          {heading}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{subhead}</p>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {step === "cta" && (
          <>
            <ul className="space-y-2.5">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <svg
                    viewBox="0 0 20 20"
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={begin}
                disabled={loading}
                className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {hasFlags ? "Get my fixes — $5" : "Get my report — $5"}
              </button>
              <span className="text-xs text-ink-faint">
                One-time, per report. Saved to your account forever.
              </span>
            </div>
            {!ready && (
              <p className="mt-3 text-xs text-ink-faint">
                Accounts aren&rsquo;t configured yet, so checkout is disabled in
                this environment.
              </p>
            )}
          </>
        )}

        {step === "auth" && (
          <div className="mx-auto max-w-sm">
            <AuthForm
              initialMode="signup"
              heading="Create your account"
              subheading="So your $5 report is saved and you can reopen it on any device, forever."
              onAuthed={() => setStep("context")}
            />
            <button
              type="button"
              onClick={() => setStep("cta")}
              className="mt-4 block w-full text-center text-sm text-ink-muted hover:text-ink"
            >
              ← Back
            </button>
          </div>
        )}

        {(step === "context" || step === "redirecting") && (
          <div className="mx-auto max-w-md">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                Anything else about your app? (optional)
              </span>
              <p className="mt-1 text-xs text-ink-faint">
                {q2Short
                  ? "Your earlier answer was short. A line or two here makes the fixes much sharper."
                  : "Extra detail helps tailor the fixes, but it's not required."}
              </p>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={step === "redirecting"}
                placeholder="e.g. it's a meal-planning app with a paid tier and a shared grocery list"
                className="mt-2 w-full resize-none rounded-lg border border-line-strong bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent disabled:opacity-60"
              />
            </label>

            {error && <p className="mt-3 text-sm text-risk-high">{error}</p>}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={startCheckout}
                disabled={step === "redirecting"}
                className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {step === "redirecting" ? "Taking you to checkout…" : "Pay $5 and unlock"}
              </button>
              <span className="text-xs text-ink-faint">
                Secure checkout by Stripe. Card never touches our servers.
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              $5, one time, for this report. By paying you agree to our{" "}
              <Link href="/terms" className="text-ink-muted underline hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/refund" className="text-ink-muted underline hover:text-ink">
                Refund Policy
              </Link>
              , and you confirm the report is generated immediately on purchase.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
