import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandIcon from "@/components/BrandIcon";
import RiskMeter from "@/components/RiskMeter";
import TrackTheme from "@/components/TrackTheme";
import { getTrack } from "@/lib/tracks";
import type { Track } from "@/lib/types";
import { VERDICT, clampScoreToLevel, isRiskLevel } from "@/lib/verdict";

// Stateless shareable result: the score and level ride in the path, the track
// rides in ?track=game. The page renders from the URL alone, in the matching
// theme (game = dark/green), so a shared screenshot reads as app or game.

type Params = Promise<{ level: string; score: string }>;
type Search = Promise<{ track?: string }>;

function parse(levelRaw: string, scoreRaw: string) {
  const level = decodeURIComponent(levelRaw).toUpperCase();
  const score = parseInt(scoreRaw, 10);
  if (!isRiskLevel(level) || Number.isNaN(score)) return null;
  return { level, score: clampScoreToLevel(level, score) };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const { level, score } = await params;
  const { track: trackRaw } = await searchParams;
  const track: Track = trackRaw === "game" ? "game" : "app";
  const cfg = getTrack(track);
  const parsed = parse(level, score);
  if (!parsed) return { title: "VibeCheck" };
  const v = VERDICT[parsed.level];
  const title = `This AI-built ${cfg.noun} scored ${parsed.score}/100 on VibeCheck: ${v.pill}`;
  const description = `Find out if your AI-built ${cfg.noun} will get flagged by Apple before you submit. Free check, with deep fixes for ${cfg.priceLabel}.`;
  const ogUrl = `/api/og?level=${parsed.level}&score=${parsed.score}&track=${track}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { level, score } = await params;
  const { track: trackRaw } = await searchParams;
  const track: Track = trackRaw === "game" ? "game" : "app";
  const cfg = getTrack(track);
  const parsed = parse(level, score);
  if (!parsed) notFound();
  const v = VERDICT[parsed.level];

  return (
    <TrackTheme track={track}>
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
        <div className="mb-8 flex items-center gap-2.5">
          <BrandIcon track={track} size="sm" />
          <span className="text-sm font-semibold tracking-tight text-ink">
            VibeCheck
          </span>
        </div>

        <div className="w-full rounded-[var(--radius-card)] border border-line bg-surface p-7 shadow-card sm:p-8">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
            {cfg.Noun} rejection risk
          </p>
          <div className="mt-3">
            <span
              className="inline-flex rounded-full px-5 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: v.colorVar, color: "#ffffff" }}
            >
              {v.pill}
            </span>
          </div>
          <div className="mt-6">
            <RiskMeter score={parsed.score} color={v.colorVar} />
          </div>
        </div>

        <Link
          href={cfg.href}
          className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Check your {cfg.noun}
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <p className="mt-3 text-xs text-ink-faint">
          Free check. Takes about 10 seconds.
        </p>
      </main>
    </TrackTheme>
  );
}
