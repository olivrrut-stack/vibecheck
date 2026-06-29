// The result's hero "graph": a green-to-red rejection-risk gauge with the
// app's score marked on it. Carries the verdict visually so the page leans on
// a meter, not a wall of text.
export default function RiskMeter({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Rejection risk
        </span>
        <span className="font-display font-extrabold tabular-nums" style={{ color }}>
          <span className="text-4xl">{pct}</span>
          <span className="text-sm font-bold text-ink-faint"> / 100</span>
        </span>
      </div>

      <div
        className="relative mt-2.5 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to right, var(--color-risk-low) 0%, var(--color-risk-medium) 55%, var(--color-risk-high) 100%)",
        }}
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Rejection risk score"
      >
        <span
          className="absolute top-1/2 h-5 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>Clear</span>
        <span>Likely rejected</span>
      </div>
    </div>
  );
}
