import type { Track } from "./types";

// Per-track configuration shared by client and server: pricing, copy, and the
// route each track lives at. The app track is unchanged; the game track adds the
// $7.99 price and game-flavored copy.
export interface TrackConfig {
  id: Track;
  /** Short label for the switcher ("App dev" / "Game dev"). */
  label: string;
  /** Lowercase noun for copy ("app" / "game"). */
  noun: string;
  /** Capitalized noun ("App" / "Game"). */
  Noun: string;
  href: string;
  priceCents: number;
  priceLabel: string;
  subtitle: string;
  hero: string;
  /** Name shown on the Stripe charge + receipt. */
  productName: string;
}

export const TRACKS: Record<Track, TrackConfig> = {
  app: {
    id: "app",
    label: "App dev",
    noun: "app",
    Noun: "App",
    href: "/",
    priceCents: 500,
    priceLabel: "$5",
    subtitle: "App Rejection Risk Checker",
    hero: "The rejection-risk check is free. When you're ready, unlock the exact fixes, written for your app, for $5.",
    productName: "VibeCheck Fix Report",
  },
  game: {
    id: "game",
    label: "Game dev",
    noun: "game",
    Noun: "Game",
    href: "/games",
    priceCents: 799,
    priceLabel: "$7.99",
    subtitle: "Game Rejection Risk Checker",
    hero: "The rejection-risk check is free. When you're ready, unlock the exact fixes, written for your game, for $7.99.",
    productName: "VibeCheck Game Fix Report",
  },
};

/** Normalize any untrusted value to a track config (defaults to app). */
export function getTrack(value: unknown): TrackConfig {
  return value === "game" ? TRACKS.game : TRACKS.app;
}
