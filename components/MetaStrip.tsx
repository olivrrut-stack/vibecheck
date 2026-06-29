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
      className="flex w-full items-stretch overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          role="listitem"
          className={`flex min-w-[60px] flex-1 flex-col items-center justify-center px-2 text-center first:pl-0 last:pr-0 ${
            i > 0 ? "border-l border-line" : ""
          }`}
        >
          <div className="flex items-center justify-center font-display text-lg font-extrabold leading-none text-ink whitespace-nowrap">
            {cell.value}
          </div>
          <div className="mt-1 font-display text-xs font-bold leading-tight text-ink-muted whitespace-nowrap">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
