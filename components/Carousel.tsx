"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// The App Store screenshot gallery, made interactive. A horizontal snap-scroll
// track of portrait cards you swipe through like a listing's screenshots, with
// page dots, prev/next controls, and a live "N of M" announcement. Reused for
// the questions (input) and the App Review Notes (result) so both read as the
// same gallery — the signature element of the whole pastiche.

export default function Carousel({
  items,
  unitLabel,
  ariaLabel,
  itemClassName = "w-[80vw] max-w-[300px] sm:w-[300px]",
}: {
  items: ReactNode[];
  /** Singular noun for the position read-out, e.g. "Question" or "Note". */
  unitLabel: string;
  ariaLabel: string;
  /** Width sizing for each card slot. */
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = items.length;

  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slots = Array.from(track.children) as HTMLElement[];
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slots.forEach((slot, i) => {
      const slotCenter = slot.offsetLeft + slot.offsetWidth / 2;
      const dist = Math.abs(slotCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [syncActive]);

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slot = track.children[i] as HTMLElement | undefined;
    if (!slot) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = slot.offsetLeft - (track.clientWidth - slot.offsetWidth) / 2;
    track.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, []);

  const go = (delta: number) =>
    scrollToIndex(Math.min(count - 1, Math.max(0, active + delta)));

  return (
    <div>
      <div
        ref={trackRef}
        aria-label={ariaLabel}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={i}
            role="group"
            aria-label={`${unitLabel} ${i + 1} of ${count}`}
            className={`shrink-0 snap-center ${itemClassName}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Gallery controls: dots + position + prev/next, App Store style. */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="tablist" aria-label={`${ariaLabel} pages`}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to ${unitLabel.toLowerCase()} ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-5 bg-ink"
                  : "w-2 bg-line-strong hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted tabular-nums"
          >
            {unitLabel} {active + 1} / {count}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={active === 0}
              aria-label={`Previous ${unitLabel.toLowerCase()}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={active === count - 1}
              aria-label={`Next ${unitLabel.toLowerCase()}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
