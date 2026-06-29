"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getTrack } from "@/lib/tracks";
import type { Answers, Diagnosis, GameAnswers, Track } from "@/lib/types";
import AuthForm from "./auth/AuthForm";
import { useAuth } from "./auth/AuthProvider";

// The paid upsell on the result and its inline purchase flow:
//   cta  ->  (account step if logged out)  ->  optional context  ->  Stripe
// Payment + fix generation happen server-side (/api/checkout, /api/unlock).
// Track-aware: app sells $5 fixes, game sells $7.99 fixes.

type Step = "cta" | "auth" | "context" | "redirecting";

// Until Stripe finishes verifying the account, payments are off and the report
// shows an "Unlocking this week" state with an email-notify capture instead of a
// live buy button. Flip NEXT_PUBLIC_PAYMENTS_LIVE="true" in Vercel to switch the
// real checkout on (no code change needed).
const PAYMENTS_LIVE = process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "true";

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// The pre-launch capture: makes it unmistakable the report can't be bought yet,
// and lets a visitor leave an email to hear the moment it goes live.
function ComingSoon({ price, track }: { price: string; track: Track }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setState("saving");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, track }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Couldn't save your email. Please try again.";
        setError(msg);
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-accent">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="font-display text-[11px] uppercase tracking-[0.16em]">
          Unlocking this week
        </span>
      </span>

      <p className="mt-3 text-2xl font-bold text-ink">
        {price}{" "}
        <span className="text-sm font-medium text-ink-faint">
          one-time, per report
        </span>
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Deep fixes unlock this week. Drop your email and we&rsquo;ll tell you the
        moment they go live, no account needed.
      </p>

      {state === "done" ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-risk-low">
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d="M3.5 8.5l3 3 6-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          You&rsquo;re on the list. We&rsquo;ll be in touch this week.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "saving"}
            placeholder="you@example.com"
            aria-label="Email to notify when fixes unlock"
            className="flex-1 rounded-full border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "saving"}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {state === "saving" ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-risk-high">{error}</p>}
    </div>
  );
}

export default function UnlockPanel({
  diagnosis,
  answers,
  track = "app",
}: {
  diagnosis: Diagnosis;
  answers: Answers | GameAnswers;
  track?: Track;
}) {
  const { user, loading, ready } = useAuth();
  const [step, setStep] = useState<Step>("cta");
  const [extra, setExtra] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cfg = getTrack(track);
  const noun = cfg.noun;
  const price = cfg.priceLabel;

  // The gating free-text field differs per track.
  const primaryKey = track === "game" ? "originality" : "safariDiff";
  const primaryText =
    ((answers as unknown as Record<string, unknown>)[primaryKey] as string) ??
    "";
  const primaryShort = primaryText.trim().length < 40;

  const hasFlags = diagnosis.risks.length > 0;
  const includes = hasFlags
    ? [
        "The root cause of each flag, tied to your answers",
        "Exactly what to change, step by step",
        `A worked example built for your ${noun}'s category`,
        "What the reviewer needs to see to approve",
        "Paste-ready App Review notes to pre-clear it",
        "Subjective, reviewer-judgment risks your answers reveal",
      ]
    : [
        `The guidelines a reviewer will still scrutinize for a ${noun} like yours`,
        "Exactly what to tighten to push your risk toward zero",
        `A worked example built for your ${noun}'s category`,
        "What the reviewer needs to see to approve on the first try",
        "Paste-ready App Review notes to pre-clear your submission",
        "Subjective, reviewer-judgment risks your answers reveal",
      ];
  const heading = hasFlags
    ? `Get the exact fixes, written for your ${noun}`
    : "Lock in your approval and drive the risk to zero";
  const subhead = hasFlags
    ? "The free notes tell you what’s wrong. This tells you precisely how to fix every flag and get approved."
    : `You’re already low risk. This gives you the exact steps to make approval bulletproof and close the last gaps before you submit.`;

  function begin() {
    setError(null);
    setStep(user ? "context" : "auth");
  }

  async function startCheckout() {
    setError(null);
    setStep("redirecting");

    // Fold any extra context into the gating free-text so the generator uses it.
    const merged = extra.trim()
      ? {
          ...answers,
          [primaryKey]: `${primaryText.trim()}\n\nMore about the ${noun}: ${extra.trim()}`,
        }
      : answers;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: merged, diagnosis, track }),
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
          <span className="font-display text-xs uppercase tracking-[0.2em]">
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
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden>
                    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {PAYMENTS_LIVE ? (
              <>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={begin}
                    disabled={loading}
                    className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {hasFlags ? `Get my fixes for ${price}` : `Get my report for ${price}`}
                  </button>
                  <span className="text-xs text-ink-faint">
                    One-time, per report. Saved to your account forever.
                  </span>
                </div>
                {!ready && (
                  <p className="mt-3 text-xs text-ink-faint">
                    Accounts aren&rsquo;t configured yet, so checkout is disabled
                    in this environment.
                  </p>
                )}
              </>
            ) : (
              <div className="mt-6">
                <ComingSoon price={price} track={track} />
              </div>
            )}
          </>
        )}

        {step === "auth" && (
          <div className="mx-auto max-w-sm">
            <AuthForm
              initialMode="signup"
              heading="Create your account"
              subheading={`So your ${price} report is saved and you can reopen it on any device, forever.`}
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
              <span className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                Anything else about your {noun}? (optional)
              </span>
              <p className="mt-1 text-xs text-ink-faint">
                {primaryShort
                  ? "Your earlier answer was short. A line or two here makes the fixes much sharper."
                  : "Extra detail helps tailor the fixes, but it's not required."}
              </p>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={step === "redirecting"}
                placeholder={
                  track === "game"
                    ? "e.g. a roguelike with a daily challenge and cosmetic-only IAP"
                    : "e.g. it's a meal-planning app with a paid tier and a shared grocery list"
                }
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
                {step === "redirecting"
                  ? "Taking you to checkout…"
                  : `Pay ${price} and unlock`}
              </button>
              <span className="text-xs text-ink-faint">
                Secure checkout by Stripe. Card never touches our servers.
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              {price}, one time, for this report. By paying you agree to our{" "}
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
