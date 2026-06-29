// Shared types for the questionnaire input and the diagnosis output.
// Used by both the client (UI) and the server (API route).

/** Which checker the user is in: the app-dev track or the game-dev track. */
export type Track = "app" | "game";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type DownloadsCode = "Yes" | "No" | "I'm not sure";

export type WebViewShell =
  | "Yes, it's a website in a shell"
  | "No, it's fully native"
  | "I'm not sure";

export interface Answers {
  /** Q1 — which AI tool built the app. Context/personalization, not a guideline. */
  buildTool: string;
  /** Q2 — data collection / accounts (multi-select). Drives Guideline 5.1.1. */
  dataPractices: string[];
  /** Q3 — what the app does that Safari can't. The most important signal. */
  safariDiff: string;
  /** Q4 — downloads/executes code at runtime. */
  downloadsCode: DownloadsCode | "";
  /** Q5 — main screen is a WebView/website-in-a-shell. */
  webViewShell: WebViewShell | "";
  /** Q6 — native capabilities actually used (multi-select). */
  nativeFeatures: string[];
}

export interface Risk {
  /** e.g. "Guideline 4.2: Minimum Functionality" */
  guideline: string;
  /** Why their specific answers triggered this risk. */
  reason: string;
}

export interface Diagnosis {
  riskLevel: RiskLevel;
  /** 0 (certain approval) to 100 (certain rejection). Tracks riskLevel. */
  score: number;
  risks: Risk[];
  verdict: string;
  /** Which track produced this (defaults to "app"). Persisted in the report so
   *  the unlock step generates the right (app vs game) fix report. */
  track?: Track;
}

// ---- Game-dev track ------------------------------------------------------

/** Q5 gambling answer for the game track. */
export type GameGambling =
  | "No"
  | "Simulated only (no real money)"
  | "Real-money betting or prizes"
  | "I'm not sure";

/** The 6 game-dev answers. `originality` (Q3) is the gating free-text signal. */
export interface GameAnswers {
  /** Q1 — engine / AI tool used (context, not a guideline). */
  buildTool: string;
  /** Q2 — existing characters/art/music/brands. Drives 5.2 + 4.1. */
  existingIP: string[];
  /** Q3 — what makes the game original and worth playing. The key signal (4.2/4.3). */
  originality: string;
  /** Q4 — monetization (IAP, loot boxes…). Drives 3.1.1. */
  monetization: string[];
  /** Q5 — gambling / chance mechanics. Drives 5.3. */
  gambling: GameGambling | "";
  /** Q6 — audience + data. Drives 5.1.4 (Kids) + 5.1.1. */
  audienceData: string[];
}

/**
 * One guideline's deep remediation. Part of the paid ($5) fix report, written by
 * a second, deeper AI call from the saved answers + diagnosis. Distinct from the
 * free one-line `Risk.fix`: this is the fleshed-out, app-specific plan.
 */
export interface DeepFix {
  /** Matches a flagged guideline, e.g. "Guideline 4.2: Minimum Functionality". */
  guideline: string;
  /** Why THIS app, given their answers, trips this specific clause. */
  rootCause: string;
  /** Concrete, step-by-step changes in plain English. */
  whatToChange: string;
  /** A worked example tailored to the app's inferred category. */
  workedExample: string;
  /** What App Review needs to see to clear it. */
  reviewerWants: string;
  /** Copy-paste wording for the App Store "App Review Notes" field. */
  reviewNotes: string;
}

/**
 * A subjective, reviewer-judgment risk that isn't spelled out in a specific
 * guideline but can still get an app rejected (design polish, borderline
 * minimum functionality, reviewer-to-reviewer variance). Only ever grounded in
 * the developer's own answers; the list is empty when there's not enough signal.
 */
export interface SubjectiveRisk {
  /** Short label of the concern. */
  point: string;
  /** Why a reviewer might flag it given their answers, and how to reduce it. */
  detail: string;
}

/** The $5 deliverable: a deep, app-specific remediation report. */
export interface FixReport {
  /** One short paragraph framing the path from current risk to approval. */
  summary: string;
  fixes: DeepFix[];
  /** Subjective/judgment-call risks. May be empty. Optional on old reports. */
  subjectiveRisks?: SubjectiveRisk[];
}

/**
 * A purchased report as stored in Supabase (see supabase/migrations). One row
 * per app a user checks and unlocks; `fixes` is null until paid. Mirrors the
 * `reports` table columns.
 */
export interface StoredReport {
  id: string;
  user_id: string;
  answers: Answers | GameAnswers;
  diagnosis: Diagnosis;
  fixes: FixReport | null;
  paid: boolean;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
}

// ---- Questionnaire option lists (single source of truth for the UI) ----

// Major AI code/app builders. "Other" (free-text) and the empty default are
// handled in the Questionnaire, so they're intentionally not in this list.
export const BUILD_TOOLS = [
  "Cursor",
  "Claude Code",
  "Codex",
  "GitHub Copilot",
  "Windsurf",
  "Lovable",
  "Bolt",
  "v0",
  "Replit",
  "Xcode",
  "I coded it by hand",
] as const;

export const DATA_PRACTICES = [
  "Collects personal data (email, location…)",
  "Has accounts or login",
  "Has a privacy policy",
  "Users can delete their data",
  "None of these",
] as const;

export const DOWNLOADS_CODE_OPTIONS: DownloadsCode[] = [
  "Yes",
  "No",
  "I'm not sure",
];

export const WEBVIEW_OPTIONS: WebViewShell[] = [
  "Yes, it's a website in a shell",
  "No, it's fully native",
  "I'm not sure",
];

export const NATIVE_FEATURES = [
  "Camera or microphone",
  "Push notifications",
  "Works offline",
  "In-app purchases",
  "Location or health data",
  "Face ID or Touch ID",
  "None of these",
] as const;

// ---- Game-dev option lists (single source of truth for the UI) ----

export const GAME_BUILD_TOOLS = [
  "Cursor",
  "Claude Code",
  "Codex",
  "GitHub Copilot",
  "Unity",
  "Godot",
  "GameMaker",
  "Construct",
  "Phaser",
  "Lovable",
  "Bolt",
  "I coded it by hand",
] as const;

export const EXISTING_IP_OPTIONS = [
  "Original art and characters only",
  "Looks like an existing game",
  "Uses recognizable names, logos, or brands",
  "Uses music or sound from other sources",
  "I'm not sure",
] as const;

export const GAME_MONETIZATION = [
  "Free, no purchases",
  "Paid upfront",
  "In-app purchases (coins, items, levels)",
  "Loot boxes, gacha, or randomized rewards",
  "Subscriptions",
  "Ads",
] as const;

export const GAME_GAMBLING_OPTIONS: GameGambling[] = [
  "No",
  "Simulated only (no real money)",
  "Real-money betting or prizes",
  "I'm not sure",
];

export const GAME_AUDIENCE_DATA = [
  "Aimed at or likely to attract kids",
  "Has accounts or login",
  "Collects personal data",
  "Has a privacy policy",
  "None of these",
] as const;
