// Helpers for displaying and linking Apple guideline references. Shared by the
// free RiskReport and the paid FixReportView so a guideline like
// "Guideline 4.2: Minimum Functionality" renders and links identically.

// Anchors on Apple's live guidelines page.
const GUIDELINE_ANCHOR: Record<string, string> = {
  "4.2": "minimum-functionality",
  "4.3": "spam",
  "2.5.2": "software-requirements",
  "5.1.1": "data-collection-and-storage",
  "4.1": "copycats",
  "2.3.1": "accurate-metadata",
  "3.1.1": "in-app-purchase",
  // Game-track guidelines.
  "5.1.4": "kids",
  "5.2": "intellectual-property",
  "5.3": "gaming-gambling-and-lotteries",
  "4.7": "mini-apps-mini-games-streaming-games-chatbots-plug-ins-and-game-emulators",
};

export function guidelineHref(num: string): string {
  const base = "https://developer.apple.com/app-store/review/guidelines/";
  const anchor = GUIDELINE_ANCHOR[num];
  return anchor ? `${base}#${anchor}` : base;
}

/** Split a leading "Guideline X.Y" token from its title. */
export function splitGuideline(guideline: string): { tag: string; rest: string } {
  const match = guideline.match(/^(Guideline\s+[\d.]+)\s*[:—-]?\s*(.*)$/i);
  if (match) return { tag: match[1], rest: match[2] };
  return { tag: "", rest: guideline };
}

/** Just the clause number ("4.2") for badges and reference links. */
export function guidelineNumber(guideline: string): string {
  return guideline.match(/(\d+(?:\.\d+)*)/)?.[1] ?? "?";
}
