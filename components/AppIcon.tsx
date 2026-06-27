import type { CSSProperties, ReactNode } from "react";

// An Apple-style app icon: a rounded "squircle" tile with a gradient fill.
// Reused for the VibeCheck brand icon and the generated "your app" icon in the
// result, so the whole experience reads as a real App Store listing.
//
// 22.5% corner radius matches Apple's icon grid closely enough to read as a
// native app tile without an SVG superellipse mask.

type AppIconSize = "sm" | "md" | "lg";

const SIZE: Record<AppIconSize, string> = {
  sm: "h-9 w-9 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-[88px] w-[88px] text-4xl",
};

export default function AppIcon({
  gradient,
  size = "md",
  children,
  className = "",
  ring = true,
}: {
  /** CSS background value — a gradient or solid. */
  gradient: string;
  size?: AppIconSize;
  /** Glyph inside the tile (a check mark, letter, emoji, …). */
  children: ReactNode;
  className?: string;
  /** Hairline inner border that App Store icons carry on dark backgrounds. */
  ring?: boolean;
}) {
  const style: CSSProperties = { background: gradient };
  return (
    <span
      aria-hidden
      style={style}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-[22.5%] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${SIZE[size]} ${className}`}
    >
      {ring && (
        <span className="pointer-events-none absolute inset-0 rounded-[22.5%] ring-1 ring-inset ring-white/10" />
      )}
      {children}
    </span>
  );
}

// Brand gradients, kept here so the icon and the favicon stay in sync.
// Monochrome Apple blue — reads as iOS, not the generic AI blue→purple.
export const VIBE_GRADIENT =
  "linear-gradient(160deg, #4aa3ff 0%, #0a84ff 50%, #0050d6 100%)";
export const NEUTRAL_GRADIENT =
  "linear-gradient(150deg, #3a3a42 0%, #26262b 100%)";
