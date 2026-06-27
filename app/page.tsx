"use client";

import { useState } from "react";
import Questionnaire from "@/components/Questionnaire";
import RiskReport from "@/components/RiskReport";
import Spinner from "@/components/Spinner";
import type { Answers, Diagnosis } from "@/lib/types";

type Status = "idle" | "loading" | "report" | "error";

const EMPTY_ANSWERS: Answers = {
  buildTools: [],
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
    <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line-strong bg-surface font-mono text-sm text-ink"
          >
            ✓
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            VibeCheck
          </h1>
        </div>
        <p className="mt-4 text-lg leading-snug text-ink sm:text-xl">
          Find out if your AI-built app will get rejected before Apple does.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Free. No account needed. Built for Cursor, Lovable, Bolt, and Claude
          Code users.
        </p>
      </header>

      {status === "idle" && (
        <Questionnaire value={answers} onChange={setAnswers} onSubmit={runCheck} />
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-20 text-center">
          <Spinner className="h-7 w-7" />
          <p className="mt-5 text-base font-medium text-ink">
            Analyzing your app against Apple&rsquo;s guidelines…
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            This takes a few seconds
          </p>
        </div>
      )}

      {status === "report" && diagnosis && (
        <RiskReport diagnosis={diagnosis} onReset={reset} />
      )}

      {status === "error" && (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-ink">
            Something went wrong.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {errorMsg ??
              "We couldn't analyze your app just now. Your answers are still here — give it another try."}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={runCheck}
              className="w-full rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 sm:w-auto"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-line-strong bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-line pt-6">
        <p className="text-xs leading-relaxed text-ink-faint">
          VibeCheck gives an informed risk estimate based on your answers — it
          isn&rsquo;t affiliated with Apple and doesn&rsquo;t guarantee approval
          or rejection. Always read the{" "}
          <a
            href="https://developer.apple.com/app-store/review/guidelines/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            App Store Review Guidelines
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
