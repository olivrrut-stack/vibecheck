import type { Diagnosis, RiskLevel } from "@/lib/types";
import AppIcon, { NEUTRAL_GRADIENT } from "./AppIcon";
import Carousel from "./Carousel";
import MetaStrip from "./MetaStrip";
import ScreenshotCard from "./ScreenshotCard";

// The result renders as a mock App Store listing for the developer's own app:
// their "product header" with the verdict where the Get button lives, the rating
// strip repurposed as a risk summary, the risks as a swipeable "App Review
// Notes" gallery, and the verdict paragraph as the app description.

const VERDICT: Record<
  RiskLevel,
  { pill: string; short: string; color: string; onColor: string }
> = {
  HIGH: {
    pill: "Likely Rejected",
    short: "HIGH",
    color: "var(--color-risk-high)",
    onColor: "#ffffff",
  },
  MEDIUM: {
    pill: "Needs Work",
    short: "MEDIUM",
    color: "var(--color-risk-medium)",
    onColor: "#ffffff",
  },
  LOW: {
    pill: "Looks Clear",
    short: "LOW",
    color: "var(--color-risk-low)",
    onColor: "#ffffff",
  },
};

// Pull a leading "Guideline X.Y" token out so we can set it in mono — the
// guideline number is a real clause reference, so it earns the structural face.
function splitGuideline(guideline: string): { tag: string; rest: string } {
  const match = guideline.match(/^(Guideline\s+[\d.]+)\s*[:—-]?\s*(.*)$/i);
  if (match) return { tag: match[1], rest: match[2] };
  return { tag: "", rest: guideline };
}

// Just the clause number ("4.2") for the rating-strip "top issue" cell.
function guidelineNumber(guideline: string): string {
  return guideline.match(/(\d+(?:\.\d+)*)/)?.[1] ?? "?";
}

export default function RiskReport({
  diagnosis,
  onReset,
}: {
  diagnosis: Diagnosis;
  onReset: () => void;
}) {
  const v = VERDICT[diagnosis.riskLevel];
  const count = diagnosis.risks.length;
  const topIssue = count > 0 ? guidelineNumber(diagnosis.risks[0].guideline) : "None";

  const noteCards = diagnosis.risks.map((risk) => {
    const { tag, rest } = splitGuideline(risk.guideline);
    return (
      <ScreenshotCard key={risk.guideline + risk.reason.slice(0, 16)} eyebrow={tag || "Guideline"} accent={v.color}>
        <h4 className="text-lg font-bold leading-tight text-ink">
          {rest || risk.guideline}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {risk.reason}
        </p>
        <div className="mt-auto pt-5">
          <div className="rounded-lg border border-line bg-surface-2 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              The fix
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{risk.fix}</p>
          </div>
        </div>
      </ScreenshotCard>
    );
  });

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
              Your App
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              Submitted via VibeCheck
            </p>
            <div className="mt-3">
              <span
                className="inline-flex rounded-full px-5 py-1.5 text-sm font-semibold"
                style={{ backgroundColor: v.color, color: v.onColor }}
              >
                {v.pill}
              </span>
            </div>
          </div>
        </div>

        {/* Rating strip, repurposed: risk level / flag count / top clause. */}
        <div className="mt-5 border-y border-line py-4">
          <MetaStrip
            cells={[
              { value: <span style={{ color: v.color }}>{v.short}</span>, label: "Risk Level" },
              { value: String(count), label: count === 1 ? "Flag" : "Flags" },
              { value: topIssue, label: "Top Issue" },
            ]}
          />
        </div>
      </header>

      {/* App Review Notes — the specific guideline risks, as a screenshot gallery. */}
      <section>
        <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          App Review Notes{count > 0 ? ` · ${count}` : ""}
        </h3>
        {count > 0 ? (
          <Carousel items={noteCards} unitLabel="Note" ariaLabel="App review notes" />
        ) : (
          <div className="rounded-[28px] border border-line bg-surface p-6 text-sm leading-relaxed text-ink-muted">
            No specific guideline citations were generated. See the verdict below.
          </div>
        )}
      </section>

      {/* App description = the reviewer's plain-English verdict. */}
      <section className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Reviewer&rsquo;s verdict
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink sm:text-base">
          {diagnosis.verdict}
        </p>
      </section>

      <div className="pt-2">
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
