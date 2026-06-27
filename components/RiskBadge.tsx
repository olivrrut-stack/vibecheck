import type { RiskLevel } from "@/lib/types";

const CONFIG: Record<
  RiskLevel,
  { dot: string; label: string; tagline: string; color: string; glow: string }
> = {
  HIGH: {
    dot: "🔴",
    label: "HIGH RISK",
    tagline: "Don't submit yet",
    color: "var(--color-risk-high)",
    glow: "rgba(240, 80, 110, 0.16)",
  },
  MEDIUM: {
    dot: "🟡",
    label: "MEDIUM RISK",
    tagline: "Fix these before submitting",
    color: "var(--color-risk-medium)",
    glow: "rgba(232, 178, 58, 0.16)",
  },
  LOW: {
    dot: "🟢",
    label: "LOW RISK",
    tagline: "You're probably good to go",
    color: "var(--color-risk-low)",
    glow: "rgba(55, 200, 113, 0.16)",
  },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const c = CONFIG[level];
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-card)] border p-7 sm:p-9"
      style={{
        borderColor: c.color,
        backgroundImage: `radial-gradient(600px 220px at 0% 0%, ${c.glow}, transparent 70%)`,
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Left accent rail — the "stamped verdict" edge. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: c.color }}
      />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
        Review verdict
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl leading-none" aria-hidden>
          {c.dot}
        </span>
        <h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: c.color }}
        >
          {c.label}
        </h2>
      </div>
      <p className="mt-2 text-lg text-ink sm:text-xl">{c.tagline}</p>
    </div>
  );
}
