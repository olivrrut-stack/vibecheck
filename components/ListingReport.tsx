"use client";

import { useState } from "react";
import type { ListingDiagnosis } from "@/lib/types";
import { VERDICT } from "@/lib/verdict";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

const FIELD_SHORT: Record<string, string> = {
  "App name": "APP",
  Subtitle: "SUB",
  Keywords: "KEY",
  Description: "DESC",
  Screenshots: "IMG",
};

export default function ListingReport({
  result,
  onReset,
}: {
  result: ListingDiagnosis;
  onReset: () => void;
}) {
  const v = VERDICT[result.riskLevel];
  const count = result.issues.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="vc-rise">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex rounded-full px-5 py-1.5 text-sm font-semibold"
            style={{ backgroundColor: v.colorVar, color: "#ffffff" }}
          >
            {v.pill}
          </span>
          <span className="text-sm text-ink-muted">
            {count === 0
              ? "No issues found"
              : `${count} issue${count === 1 ? "" : "s"} found`}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Listing metadata review
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Checked against Guideline 2.3.1: Accurate Metadata
        </p>
      </header>

      {/* Issues */}
      <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
          Issues{count > 0 ? ` · ${count}` : ""}
        </h3>

        {count > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {result.issues.map((issue, i) => (
              <li key={i} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-[9px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${v.colorVar} 14%, transparent)`,
                    color: v.colorVar,
                  }}
                >
                  {FIELD_SHORT[issue.field] ?? issue.field.slice(0, 4).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
                    {issue.field}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">
                    {issue.problem}
                  </p>
                  <div className="mt-2.5 rounded-lg bg-surface-2 px-3.5 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                      Fix
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink">
                      {issue.fix}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${v.colorVar} 14%, transparent)`,
                color: v.colorVar,
              }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              No metadata issues found. Your listing looks clean.
            </p>
          </div>
        )}
      </section>

      {/* Cleaned keywords */}
      {result.cleanedKeywords && (
        <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
              Cleaned keywords
            </h3>
            <CopyButton text={result.cleanedKeywords} />
          </div>
          <p className="mt-3 font-mono text-sm leading-relaxed text-ink">
            {result.cleanedKeywords}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {result.cleanedKeywords.length}/100 characters
          </p>
        </section>
      )}

      {/* App Review Notes */}
      {result.reviewNotes && (
        <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
              App Review Notes
            </h3>
            <CopyButton text={result.reviewNotes} />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Paste this into the &ldquo;App Review Notes&rdquo; field when you submit in App Store Connect.
          </p>
          <div className="mt-3 rounded-lg bg-surface-2 px-4 py-3">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
              {result.reviewNotes}
            </p>
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full border border-line-strong bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
        >
          Check another listing
        </button>
        <a
          href="/"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line-strong bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
        >
          Also check your app behaviour
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
