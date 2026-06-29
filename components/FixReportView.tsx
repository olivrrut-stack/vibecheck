"use client";

import { useState } from "react";
import {
  guidelineHref,
  guidelineNumber,
  splitGuideline,
} from "@/lib/guidelines";
import type { DeepFix, FixReport } from "@/lib/types";

// Renders the paid deep-fix report: a plan summary, then one card per flagged
// guideline with its root cause, the concrete changes, a worked example, what
// the reviewer wants, and copy-ready App Review notes. Matches the App Review
// Notes panel on the free result so the paid report feels like the same product.

function CopyNotes({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard blocked; the text is selectable below regardless
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FixPart({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </p>
      <div className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

function FixCard({ fix }: { fix: DeepFix }) {
  const { tag, rest } = splitGuideline(fix.guideline);
  const num = guidelineNumber(fix.guideline);

  return (
    <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono text-sm font-bold text-accent">
          {num}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-base font-bold text-ink">{rest || fix.guideline}</h3>
            {tag && <span className="font-mono text-xs text-ink-muted">{tag}</span>}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5 border-t border-line pt-5">
        <FixPart label="Why this matters">{fix.rootCause}</FixPart>
        <FixPart label="What to change">{fix.whatToChange}</FixPart>
        <FixPart label="Worked example">{fix.workedExample}</FixPart>
        <FixPart label="What the reviewer wants">{fix.reviewerWants}</FixPart>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              App Review notes (paste this)
            </p>
            <CopyNotes text={fix.reviewNotes} />
          </div>
          <p className="mt-1.5 whitespace-pre-line rounded-lg border border-line bg-surface-2 p-4 text-sm leading-relaxed text-ink">
            {fix.reviewNotes}
          </p>
        </div>

        <a
          href={guidelineHref(num)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          Read Guideline {num} on Apple
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M7 17L17 7M9 7h8v8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default function FixReportView({ report }: { report: FixReport }) {
  return (
    <div className="space-y-6">
      <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
          Your path to approval
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink sm:text-base">
          {report.summary}
        </p>
      </section>

      {report.fixes.map((fix, i) => (
        <FixCard key={`${fix.guideline}-${i}`} fix={fix} />
      ))}
    </div>
  );
}
