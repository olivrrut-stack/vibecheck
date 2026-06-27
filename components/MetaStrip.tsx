import type { ReactNode } from "react";

// Apple's signature metadata strip — the horizontal row of value/label cells
// divided by hairlines that sits under the icon on every App Store listing
// ("4.7 ★ / RATINGS", "#1 / CATEGORY", "4+ / AGE", …). We reuse the exact
// anatomy for the questionnaire header and the verdict summary, because this
// strip is the single most recognizable "this is the App Store" cue.

export interface MetaCell {
  /** The bold value line (can be colored/iconified). */
  value: ReactNode;
  /** The small uppercase label beneath it. */
  label: string;
}

export default function MetaStrip({ cells }: { cells: MetaCell[] }) {
  return (
    <div
      className="flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          role="listitem"
          className={`flex min-w-0 shrink-0 flex-col items-center justify-center px-5 text-center first:pl-0 last:pr-0 ${
            i > 0 ? "border-l border-line" : ""
          }`}
        >
          <div className="text-sm font-bold leading-none text-ink whitespace-nowrap">
            {cell.value}
          </div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted whitespace-nowrap">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
