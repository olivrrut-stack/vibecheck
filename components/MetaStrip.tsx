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
      className="flex w-full items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          role="listitem"
          className={`flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-center first:pl-0 last:pr-0 sm:min-w-[60px] sm:px-2 ${
            i > 0 ? "border-l border-line" : ""
          }`}
        >
          <div className="flex items-center justify-center text-[10px] font-bold leading-none text-ink whitespace-nowrap sm:text-sm">
            {cell.value}
          </div>
          <div className="mt-1 font-mono text-[8px] uppercase tracking-normal text-ink-muted whitespace-nowrap sm:mt-1.5 sm:text-[10px] sm:tracking-[0.14em]">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
