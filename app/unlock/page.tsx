"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import BrandBar from "@/components/BrandBar";
import FixReportView from "@/components/FixReportView";
import Spinner from "@/components/Spinner";
import TrackTheme from "@/components/TrackTheme";
import { getTrack } from "@/lib/tracks";
import { VERDICT } from "@/lib/verdict";
import type { StoredReport, Track } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "done"; report: StoredReport }
  | { kind: "error"; message: string; retryable: boolean }
  | { kind: "needsLogin" };

function UnlockInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const track: Track = params.get("track") === "game" ? "game" : "app";
  const cfg = getTrack(track);
  const [state, setState] = useState<State>({ kind: "loading" });

  const run = useCallback(async () => {
    if (!sessionId) {
      setState({
        kind: "error",
        message: "This link is missing its checkout session.",
        retryable: false,
      });
      return;
    }
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data: unknown = await res.json().catch(() => null);

      if (res.status === 401) {
        setState({ kind: "needsLogin" });
        return;
      }
      if (!res.ok || !data || typeof data !== "object" || !("report" in data)) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "We couldn't finish your report.";
        const retryable =
          !!data &&
          typeof data === "object" &&
          "retryable" in data &&
          Boolean((data as { retryable: unknown }).retryable);
        setState({ kind: "error", message, retryable });
        return;
      }
      setState({ kind: "done", report: (data as { report: StoredReport }).report });
    } catch {
      setState({
        kind: "error",
        message: "Could not reach the server. Please try again.",
        retryable: true,
      });
    }
  }, [sessionId]);

  useEffect(() => {
    run();
  }, [run]);

  function content() {
    if (state.kind === "loading") {
      return (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-20 text-center shadow-card">
          <Spinner className="h-7 w-7" />
          <p className="mt-5 text-base font-medium text-ink">
            Payment received. Writing your fixes…
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            This takes up to a minute
          </p>
        </div>
      );
    }

    if (state.kind === "needsLogin") {
      const next = sessionId
        ? `/unlock?session_id=${sessionId}&track=${track}`
        : "/reports";
      return (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-base font-medium text-ink">Please log in to view this report.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Use the same account you bought it with. Your report is waiting.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      );
    }

    if (state.kind === "error") {
      return (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-base font-medium text-ink">Almost there.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{state.message}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {state.retryable && (
              <button
                type="button"
                onClick={run}
                className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                Finish my report
              </button>
            )}
            <Link
              href="/reports"
              className="w-full rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
            >
              My reports
            </Link>
          </div>
        </div>
      );
    }

    const v = VERDICT[state.report.diagnosis.riskLevel];
    return (
      <div className="space-y-6">
        <header className="vc-rise">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Unlocked · Fix report
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Here&rsquo;s how to get approved
            </h1>
            <span
              className="inline-flex rounded-full px-4 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: v.colorVar }}
            >
              {v.pill}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            Saved to your account. Reopen it anytime from{" "}
            <Link href="/reports" className="font-medium text-accent hover:underline">
              My reports
            </Link>
            .
          </p>
        </header>

        {state.report.fixes ? (
          <FixReportView report={state.report.fixes} />
        ) : (
          <p className="text-sm text-ink-muted">
            Your fixes are still being written. Reload in a moment.
          </p>
        )}

        <div className="pt-2">
          <Link
            href={cfg.href}
            className="inline-flex rounded-full border border-line-strong bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Check another {cfg.noun}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TrackTheme track={track}>
      <main className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-12">
        <BrandBar />
        {content()}
      </main>
    </TrackTheme>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh" />}>
      <UnlockInner />
    </Suspense>
  );
}
