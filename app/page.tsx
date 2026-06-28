"use client";

import { useState } from "react";
import AccountMenu from "@/components/AccountMenu";
import AppIcon, { VIBE_GRADIENT } from "@/components/AppIcon";
import Questionnaire from "@/components/Questionnaire";
import RiskReport from "@/components/RiskReport";
import SiteFooter from "@/components/SiteFooter";
import Spinner from "@/components/Spinner";
import StoreHeader from "@/components/StoreHeader";
import type { Answers, Diagnosis } from "@/lib/types";

type Status = "idle" | "loading" | "report" | "error";

const EMPTY_ANSWERS: Answers = {
  dataPractices: [],
  safariDiff: "",
  downloadsCode: "",
  webViewShell: "",
  nativeFeatures: [],
};

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function runCheck() {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data: unknown = await res.json().catch(() => null);
      // Trust nothing: surface the server's message and require a real
      // diagnosis shape before rendering the report.
      if (!res.ok || !data || typeof data !== "object" || !("riskLevel" in data)) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : null;
        setErrorMsg(message);
        setStatus("error");
        return;
      }
      setDiagnosis(data as Diagnosis);
      setStatus("report");
    } catch {
      setErrorMsg(null);
      setStatus("error");
    }
  }

  function reset() {
    setAnswers(EMPTY_ANSWERS);
    setDiagnosis(null);
    setErrorMsg(null);
    setStatus("idle");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-14">
      {/* Top bar: brand on the left once the main panel stops being VibeCheck's
          own listing (on idle the StoreHeader carries branding), account menu on
          the right in every state. */}
      <div className="mb-8 flex items-center justify-between gap-3">
        {status !== "idle" ? (
          <div className="flex items-center gap-2.5">
            <AppIcon gradient={VIBE_GRADIENT} size="sm">
              <svg viewBox="0 0 44 64" className="h-7" aria-hidden>
                <rect x="2" y="2" width="40" height="60" rx="9" fill="white" />
                <rect x="16" y="6.5" width="12" height="3.4" rx="1.7" fill="#0a0a0b" />
                <path
                  d="M14 33l7 7 13-15.5"
                  fill="none"
                  stroke="#0a6cff"
                  strokeWidth="5.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </AppIcon>
            <span className="text-sm font-semibold tracking-tight text-ink">
              VibeCheck
            </span>
          </div>
        ) : (
          <span aria-hidden />
        )}
        <AccountMenu />
      </div>

      {status === "idle" && (
        <div className="space-y-6 sm:space-y-8">
          <StoreHeader />
          <section className="space-y-4 sm:space-y-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                Pre-submission review
              </p>
              <h2 className="mt-1.5 text-lg font-bold tracking-tight text-ink">
                Tell us about your app
              </h2>
            </div>
            <Questionnaire
              value={answers}
              onChange={setAnswers}
              onSubmit={runCheck}
            />
          </section>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-20 text-center shadow-card">
          <Spinner className="h-7 w-7" />
          <p className="mt-5 text-base font-medium text-ink">
            Submitting your app for review…
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            Checking against Apple&rsquo;s guidelines
          </p>
        </div>
      )}

      {status === "report" && diagnosis && (
        <RiskReport diagnosis={diagnosis} answers={answers} onReset={reset} />
      )}

      {status === "error" && (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-base font-medium text-ink">Couldn&rsquo;t finish the review.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {errorMsg ??
              "We couldn't analyze your app just now. Your answers are still here, so give it another try."}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={runCheck}
              className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
