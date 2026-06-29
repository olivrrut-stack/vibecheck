import type { ReactNode } from "react";

// A single "screenshot" in the gallery: a portrait, phone-shaped card with a
// faux iOS status bar (9:41 — Apple's canonical demo time) so each question and
// each review note reads as an actual App Store screenshot, not a generic card.
export default function ScreenshotCard({
  eyebrow,
  accent,
  children,
}: {
  eyebrow: string;
  /** Optional accent color for the eyebrow (used by risk notes). */
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[440px] flex-col overflow-hidden rounded-[28px] border border-line bg-surface shadow-card">
      {/* Faux iOS status bar. */}
      <div className="flex items-center justify-between px-5 pt-3 text-ink-faint">
        <span className="font-mono text-[11px] font-medium tabular-nums">9:41</span>
        <span className="flex items-center gap-1" aria-hidden>
          {/* signal */}
          <svg viewBox="0 0 18 12" className="h-2.5 w-3.5" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="0.5" />
            <rect x="5" y="5" width="3" height="7" rx="0.5" />
            <rect x="10" y="2" width="3" height="10" rx="0.5" opacity="0.5" />
            <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.5" />
          </svg>
          {/* wifi */}
          <svg viewBox="0 0 16 12" className="h-2.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1 3.5a10 10 0 0 1 14 0" strokeLinecap="round" />
            <path d="M3.5 6.5a6 6 0 0 1 9 0" strokeLinecap="round" />
            <circle cx="8" cy="9.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          {/* battery */}
          <svg viewBox="0 0 26 12" className="h-2.5 w-5" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" />
            <rect x="2.5" y="2.5" width="14" height="7" rx="1" fill="currentColor" stroke="none" />
            <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <p
          className="font-display text-[11px] uppercase tracking-[0.2em]"
          style={accent ? { color: accent } : undefined}
        >
          <span className={accent ? "" : "text-ink-faint"}>{eyebrow}</span>
        </p>
        <div className="mt-2.5 flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
