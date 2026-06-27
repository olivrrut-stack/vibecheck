// Shared types for the questionnaire input and the diagnosis output.
// Used by both the client (UI) and the server (API route).

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type DownloadsCode = "Yes" | "No" | "I'm not sure";

export type WebViewShell =
  | "Yes it's basically a website in a shell"
  | "No it's fully native"
  | "I'm not sure";

export interface Answers {
  /** Q1 — how the app was built (multi-select). */
  buildTools: string[];
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
  /** e.g. "Guideline 4.3 — Minimum Functionality" */
  guideline: string;
  /** Why their specific answers triggered this risk. */
  reason: string;
  /** The exact fix in plain English. */
  fix: string;
}

export interface Diagnosis {
  riskLevel: RiskLevel;
  risks: Risk[];
  verdict: string;
}

// ---- Questionnaire option lists (single source of truth for the UI) ----

export const BUILD_TOOLS = [
  "Cursor",
  "Lovable",
  "Bolt.new",
  "Claude Code",
  "Replit",
  "Other AI tool",
  "Traditional coding (no AI)",
] as const;

export const DOWNLOADS_CODE_OPTIONS: DownloadsCode[] = [
  "Yes",
  "No",
  "I'm not sure",
];

export const WEBVIEW_OPTIONS: WebViewShell[] = [
  "Yes it's basically a website in a shell",
  "No it's fully native",
  "I'm not sure",
];

export const NATIVE_FEATURES = [
  "Camera or microphone",
  "Push notifications",
  "Works offline without internet",
  "In-app purchases (Apple IAP)",
  "Location or health data",
  "Face ID or Touch ID",
  "None of these",
] as const;
