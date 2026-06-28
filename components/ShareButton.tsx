"use client";

import { useState } from "react";
import type { RiskLevel } from "@/lib/types";

// Shares a stateless link to /result/<level>/<score>. No account, no stored
// data: the score rides in the URL and the result page renders from it. Uses
// the native share sheet on mobile, falls back to copying the link.
export default function ShareButton({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/result/${level}/${score}`;
    const text = `My AI-built app scored ${score}/100 on VibeCheck.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "VibeCheck", text, url });
        return;
      } catch {
        // user dismissed the sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing else to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
    >
      {copied ? (
        "Link copied!"
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M8.7 10.7L15.3 7.3M8.7 13.3l6.6 3.4M18 6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm10 6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Share my score
        </>
      )}
    </button>
  );
}
