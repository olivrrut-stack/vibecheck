import type { Track } from "@/lib/types";
import AppIcon, { GAME_GRADIENT, VIBE_GRADIENT } from "./AppIcon";

type Size = "sm" | "md" | "lg";

// Glyph height per icon size, so the phone scales with the tile.
const GLYPH_H: Record<Size, string> = { sm: "h-7", md: "h-10", lg: "h-16" };

// The VibeCheck brand tile for a given track:
//  - app:  blue squircle, white phone upright, blue check
//  - game: green squircle, white phone on its side, green check
// Used by the headers and top bars so each track reads as its own listing.
export default function BrandIcon({
  track = "app",
  size = "sm",
}: {
  track?: Track;
  size?: Size;
}) {
  if (track === "game") {
    return (
      <AppIcon gradient={GAME_GRADIENT} size={size}>
        {/* Landscape phone: wider than tall, notch on the right edge. */}
        <svg viewBox="0 0 64 44" className={GLYPH_H[size]} aria-hidden>
          <rect x="2" y="2" width="60" height="40" rx="9" fill="white" />
          <rect x="54.6" y="16" width="3.4" height="12" rx="1.7" fill="#0a0a0b" />
          <path
            d="M19 22l7 7 13-15.5"
            fill="none"
            stroke="#16a34a"
            strokeWidth="5.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </AppIcon>
    );
  }
  return (
    <AppIcon gradient={VIBE_GRADIENT} size={size}>
      <svg viewBox="0 0 44 64" className={GLYPH_H[size]} aria-hidden>
        <rect x="2" y="2" width="40" height="60" rx="9" fill="white" />
        <rect x="16" y="6.5" width="12" height="3.4" rx="1.7" fill="#0a0a0b" />
        <path
          d="M14 33l7 7 13-15.5"
          fill="none"
          stroke="#0a6cff"
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AppIcon>
  );
}
