import type { Answers, Diagnosis, RiskLevel } from "./types";

// Runtime shape guards for untrusted request bodies. Shared by the routes that
// accept answers + a diagnosis from the client (fixes preview, checkout).

export function isAnswers(value: unknown): value is Answers {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    Array.isArray(a.dataPractices) &&
    typeof a.safariDiff === "string" &&
    typeof a.downloadsCode === "string" &&
    typeof a.webViewShell === "string" &&
    Array.isArray(a.nativeFeatures)
  );
}

export function isDiagnosis(value: unknown): value is Diagnosis {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  const levels: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
  if (!levels.includes(d.riskLevel as RiskLevel)) return false;
  if (typeof d.score !== "number") return false;
  if (typeof d.verdict !== "string") return false;
  if (!Array.isArray(d.risks)) return false;
  return d.risks.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as Record<string, unknown>).guideline === "string" &&
      typeof (r as Record<string, unknown>).reason === "string"
  );
}
