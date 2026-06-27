import type { Diagnosis } from "@/lib/types";
import RiskBadge from "./RiskBadge";

// Pull a leading "Guideline X.Y" token out so we can set it in mono — the
// guideline number is a real clause reference, so it earns the structural face.
function splitGuideline(guideline: string): { tag: string; rest: string } {
  const match = guideline.match(/^(Guideline\s+[\d.]+)\s*[—-]?\s*(.*)$/i);
  if (match) return { tag: match[1], rest: match[2] };
  return { tag: "", rest: guideline };
}

export default function RiskReport({
  diagnosis,
  onReset,
}: {
  diagnosis: Diagnosis;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="vc-rise">
        <RiskBadge level={diagnosis.riskLevel} />
      </div>

      {diagnosis.risks.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Rejection risks · {diagnosis.risks.length}
          </h3>
          <ul className="space-y-4">
            {diagnosis.risks.map((risk, i) => {
              const { tag, rest } = splitGuideline(risk.guideline);
              return (
                <li
                  key={`${i}-${risk.guideline}`}
                  className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6"
                  style={{ animationDelay: `${0.05 * (i + 1)}s` }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {tag && (
                      <span className="font-mono text-sm font-medium text-ink">
                        {tag}
                      </span>
                    )}
                    <span className="text-base font-bold text-ink sm:text-lg">
                      {rest || risk.guideline}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-[15px]">
                    {risk.reason}
                  </p>

                  <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                      The fix
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink">
                      {risk.fix}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section
        className="vc-rise rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6"
        style={{ animationDelay: `${0.05 * (diagnosis.risks.length + 1)}s` }}
      >
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          The verdict
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink sm:text-base">
          {diagnosis.verdict}
        </p>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-line-strong bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:w-auto"
        >
          Check another app
        </button>
      </div>
    </div>
  );
}
