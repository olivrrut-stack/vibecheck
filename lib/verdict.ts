import type { RiskLevel } from "./types";

// Verdict presentation, shared by the in-app result, the shareable result page,
// and the OG image. colorVar is for the app UI (theme token); colorHex is the
// concrete value the OG image needs (satori can't read CSS variables).
export interface VerdictInfo {
  pill: string;
  short: string;
  colorVar: string;
  colorHex: string;
}

export const VERDICT: Record<RiskLevel, VerdictInfo> = {
  HIGH: {
    pill: "Likely Rejected",
    short: "HIGH",
    colorVar: "var(--color-risk-high)",
    colorHex: "#e11d48",
  },
  MEDIUM: {
    pill: "Needs Work",
    short: "MEDIUM",
    colorVar: "var(--color-risk-medium)",
    colorHex: "#b45309",
  },
  LOW: {
    pill: "Looks Clear",
    short: "LOW",
    colorVar: "var(--color-risk-low)",
    colorHex: "#15803d",
  },
};

export function isRiskLevel(value: string): value is RiskLevel {
  return value === "HIGH" || value === "MEDIUM" || value === "LOW";
}
