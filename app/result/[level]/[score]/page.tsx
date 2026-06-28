import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppIcon, { VIBE_GRADIENT } from "@/components/AppIcon";
import RiskMeter from "@/components/RiskMeter";
import { VERDICT, clampScoreToLevel, isRiskLevel } from "@/lib/verdict";

// Stateless shareable result: the score and level ride in the path, so this
// page renders from the URL alone — no account, no stored data, no API call.

type Params = Promise<{ level: string; score: string }>;

function parse(levelRaw: string, scoreRaw: string) {
  const level = decodeURIComponent(levelRaw).toUpperCase();
  const score = parseInt(scoreRaw, 10);
  if (!isRiskLevel(level) || Number.isNaN(score)) return null;
  return { level, score: clampScoreToLevel(level, score) };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { level, score } = await params;
  const parsed = parse(level, score);
  if (!parsed) return { title: "VibeCheck" };
  const v = VERDICT[parsed.level];
  const title = `This AI-built app scored ${parsed.score}/100 on VibeCheck — ${v.pill}`;
  const description =
    "Find out if your AI-built app will get flagged by Apple before you submit. Free check, with deep fixes for $5.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: { params: Params }) {
  const { level, score } = await params;
  const parsed = parse(level, score);
  if (!parsed) notFound();
  const v = VERDICT[parsed.level];

  return (
    <main className="mx-auto flex min-h-[88vh] w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-8 flex items-center gap-2.5">
        <AppIcon gradient={VIBE_GRADIENT} size="sm">
          <svg viewBox="0 0 44 64" className="h-7" aria-hidden>
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
        <span className="text-sm font-semibold tracking-tight text-ink">
          VibeCheck
        </span>
      </div>

      <div className="w-full rounded-[var(--radius-card)] border border-line bg-surface p-7 shadow-card sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          App rejection risk
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
        href="/"
        className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
      >
        Check your app
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
  );
}
