import {
  guidelineHref,
  guidelineNumber,
  splitGuideline,
} from "@/lib/guidelines";
import { getTrack } from "@/lib/tracks";
import type { Answers, Diagnosis, GameAnswers } from "@/lib/types";
import { VERDICT } from "@/lib/verdict";
import AppIcon, { NEUTRAL_GRADIENT } from "./AppIcon";
import MetaStrip from "./MetaStrip";
import RiskMeter from "./RiskMeter";
import ShareButton from "./ShareButton";
import UnlockPanel from "./UnlockPanel";

// The result renders as a mock App Store listing for the developer's own app:
// their "product header" with the verdict where the Get button lives, a
// rejection-risk gauge, the rating strip, then one full-width "App Review Notes"
// panel where each flagged guideline is a row with a stat badge, why it fails,
// a quick fix, and a link to the real Apple clause. Below that, the locked $5
// upsell to the deep, app-specific fix report.

export default function RiskReport({
  diagnosis,
  answers,
  onReset,
}: {
  diagnosis: Diagnosis;
  answers: Answers | GameAnswers;
  onReset: () => void;
}) {
  const v = VERDICT[diagnosis.riskLevel];
  const count = diagnosis.risks.length;
  const topIssue = count > 0 ? guidelineNumber(diagnosis.risks[0].guideline) : "None";
  const track = diagnosis.track ?? "app";
  const cfg = getTrack(track);

  return (
    <div className="space-y-8">
      {/* Product header for "their app", with the verdict as the Get button. */}
      <header className="vc-rise">
        <div className="flex items-start gap-4 sm:gap-5">
          <AppIcon gradient={NEUTRAL_GRADIENT} size="lg">
            <span className="text-3xl font-bold text-white">?</span>
          </AppIcon>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Your {cfg.Noun}
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              Submitted via VibeCheck
            </p>
            <div className="mt-3">
              <span
                className="inline-flex rounded-full px-5 py-1.5 text-sm font-semibold"
                style={{ backgroundColor: v.colorVar, color: "#ffffff" }}
              >
                {v.pill}
              </span>
            </div>
          </div>
        </div>

        {/* Hero graph: the rejection-risk gauge. */}
        <div className="mt-6">
          <RiskMeter score={diagnosis.score} color={v.colorVar} />
        </div>

        <div className="mt-5 border-y border-line py-4">
          <MetaStrip
            cells={[
              { value: <span style={{ color: v.colorVar }}>{v.short}</span>, label: "Risk Level" },
              { value: String(count), label: count === 1 ? "Flag" : "Flags" },
              { value: topIssue, label: "Top Issue" },
            ]}
          />
        </div>
      </header>

      {/* App Review Notes: one full-width panel, the width of the meter. */}
      <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          App Review Notes{count > 0 ? ` · ${count}` : ""}
        </h3>

        {count > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {diagnosis.risks.map((risk) => {
              const { tag, rest } = splitGuideline(risk.guideline);
              const num = guidelineNumber(risk.guideline);
              return (
                <li
                  key={`${risk.guideline}-${risk.reason.slice(0, 16)}`}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  {/* Gamified stat badge: the clause number in the risk color. */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${v.colorVar} 14%, transparent)`,
                      color: v.colorVar,
                    }}
                  >
                    {num}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-base font-bold text-ink">
                        {rest || risk.guideline}
                      </span>
                      {tag && (
                        <span className="font-mono text-xs text-ink-muted">
                          {tag}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {risk.reason}
                    </p>

                    <p className="mt-2.5 text-sm leading-relaxed text-ink">
                      <span className="font-semibold">Quick fix: </span>
                      {risk.fix}
                    </p>

                    <a
                      href={guidelineHref(num)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
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
                </li>
              );
            })}
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
              No specific guideline flags. See the verdict below.
            </p>
          </div>
        )}
      </section>

      {/* The $5 upsell: the deep, app-specific report. Always shown once a
          score exists. With flags it sells the fixes; when clean it sells
          locking in the approval and driving the risk toward zero. */}
      <UnlockPanel diagnosis={diagnosis} answers={answers} track={track} />

      {/* App description = the reviewer's plain-English verdict. */}
      <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Reviewer&rsquo;s verdict
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink sm:text-base">
          {diagnosis.verdict}
        </p>
      </section>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <ShareButton score={diagnosis.score} level={diagnosis.riskLevel} />
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full border border-line-strong bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
        >
          Check another app
        </button>
      </div>
    </div>
  );
}
