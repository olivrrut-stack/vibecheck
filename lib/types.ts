// Shared types for the questionnaire input and the diagnosis output.
// Used by both the client (UI) and the server (API route).

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type DownloadsCode = "Yes" | "No" | "I'm not sure";

export type WebViewShell =
  | "Yes, it's a website in a shell"
  | "No, it's fully native"
  | "I'm not sure";

export interface Answers {
  /** Q1 — data collection / accounts (multi-select). Drives Guideline 5.1.1. */
  dataPractices: string[];
  /** Q2 — what the app does that Safari can't. The most important signal. */
  safariDiff: string;
  /** Q3 — downloads/executes code at runtime. */
  downloadsCode: DownloadsCode | "";
  /** Q4 — main screen is a WebView/website-in-a-shell. */
  webViewShell: WebViewShell | "";
  /** Q5 — native capabilities actually used (multi-select). */
  nativeFeatures: string[];
}

export interface Risk {
  /** e.g. "Guideline 4.2: Minimum Functionality" */
  guideline: string;
  /** Why their specific answers triggered this risk. */
  reason: string;
  /** The exact fix in plain English. */
  fix: string;
}

export interface Diagnosis {
  riskLevel: RiskLevel;
  /** 0 (certain approval) to 100 (certain rejection). Tracks riskLevel. */
  score: number;
  risks: Risk[];
  verdict: string;
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

/** The $5 deliverable: a deep, app-specific remediation report. */
export interface FixReport {
  /** One short paragraph framing the path from current risk to approval. */
  summary: string;
  fixes: DeepFix[];
}

/**
 * A purchased report as stored in Supabase (see supabase/migrations). One row
 * per app a user checks and unlocks; `fixes` is null until paid. Mirrors the
 * `reports` table columns.
 */
export interface StoredReport {
  id: string;
  user_id: string;
  answers: Answers;
  diagnosis: Diagnosis;
  fixes: FixReport | null;
  paid: boolean;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
}

// ---- Questionnaire option lists (single source of truth for the UI) ----

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
