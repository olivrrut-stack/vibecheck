"use client";

import { useState } from "react";
import BrandIcon from "@/components/BrandIcon";
import ListingForm from "@/components/ListingForm";
import ListingReport from "@/components/ListingReport";
import SiteFooter from "@/components/SiteFooter";
import Spinner from "@/components/Spinner";
import type { ListingAnswers, ListingDiagnosis } from "@/lib/types";

type Status = "idle" | "loading" | "report" | "error";

const EMPTY: ListingAnswers = {
  appName: "",
  subtitle: "",
  keywords: "",
  promoText: "",
  description: "",
};

export default function ListingChecker() {
  const [status, setStatus] = useState<Status>("idle");
  const [answers, setAnswers] = useState<ListingAnswers>(EMPTY);
  const [result, setResult] = useState<ListingDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function runCheck() {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data: unknown = await res.json().catch(() => null);
      if (
        !res.ok ||
        !data ||
        typeof data !== "object" ||
        !("riskLevel" in data)
      ) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : null;
        setErrorMsg(message);
        setStatus("error");
        return;
      }
      setResult(data as ListingDiagnosis);
      setStatus("report");
    } catch {
      setErrorMsg(null);
      setStatus("error");
    }
  }

  function reset() {
    setAnswers(EMPTY);
    setResult(null);
    setErrorMsg(null);
    setStatus("idle");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-14">
      <div className="mb-8 flex items-center gap-2.5">
        <BrandIcon track="app" size="sm" />
        <span className="text-sm font-semibold tracking-tight text-ink">
          VibeCheck
        </span>
      </div>

      {status === "idle" && (
        <div className="space-y-6 sm:space-y-8">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
              Pre-submission review
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              App Store listing checker
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
              Paste your listing text and find out if the name, subtitle,
              keywords, or description will get you rejected or penalised under
              Apple Guideline 2.3.1 before you submit.
            </p>
          </div>

          <section className="space-y-4">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
              Your listing
            </p>
            <ListingForm
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
            Reviewing your listing&hellip;
          </p>
          <p className="mt-2 font-display text-xs uppercase tracking-[0.18em] text-ink-faint">
            Checking against Guideline 2.3.1
          </p>
        </div>
      )}

      {status === "report" && result && (
        <ListingReport result={result} onReset={reset} />
      )}

      {status === "error" && (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-base font-medium text-ink">
            Couldn&rsquo;t finish the review.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {errorMsg ??
              "We couldn't analyze your listing just now. Your text is still here — give it another try."}
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
