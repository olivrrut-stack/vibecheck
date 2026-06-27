import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import type { Answers, Diagnosis, RiskLevel } from "@/lib/types";

// The diagnosis is written by Claude on every request, server-side only.
// The API key never reaches the browser.
export const runtime = "nodejs";
// The model call can take ~10-20s with thinking; raise the function ceiling so
// Vercel doesn't time it out at the default 10s.
export const maxDuration = 60;

// JSON schema that constrains the model to the exact output contract.
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    riskLevel: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          guideline: { type: "string" },
          reason: { type: "string" },
          fix: { type: "string" },
        },
        required: ["guideline", "reason", "fix"],
        additionalProperties: false,
      },
    },
    verdict: { type: "string" },
  },
  required: ["riskLevel", "risks", "verdict"],
  additionalProperties: false,
} as const;

function buildUserMessage(a: Answers): string {
  const list = (items: string[]) =>
    items.length ? items.join(", ") : "(none selected)";

  return [
    "Here are the developer's answers about their AI-built app. Assess their App Store rejection risk.",
    "",
    `Q1 — How they built the app: ${list(a.buildTools)}`,
    `Q2 — What the app does that Safari can't (minimum functionality test): ${
      a.safariDiff.trim() || "(left blank)"
    }`,
    `Q3 — Downloads or executes code from the internet at runtime: ${
      a.downloadsCode || "(not answered)"
    }`,
    `Q4 — Main screen is a website/web content inside the app (WebView shell): ${
      a.webViewShell || "(not answered)"
    }`,
    `Q5 — Native capabilities the app actually uses: ${list(a.nativeFeatures)}`,
  ].join("\n");
}

// Pull the first JSON object out of a text blob, tolerating code fences.
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(candidate.slice(start, end + 1));
}

function isValidDiagnosis(value: unknown): value is Diagnosis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const levels: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
  if (!levels.includes(v.riskLevel as RiskLevel)) return false;
  if (!Array.isArray(v.risks)) return false;
  if (typeof v.verdict !== "string") return false;
  return v.risks.every((r) => {
    if (!r || typeof r !== "object") return false;
    const risk = r as Record<string, unknown>;
    return (
      typeof risk.guideline === "string" &&
      typeof risk.reason === "string" &&
      typeof risk.fix === "string"
    );
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured. Missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let answers: Answers;
  try {
    answers = (await req.json()) as Answers;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!answers?.safariDiff?.trim()) {
    return NextResponse.json(
      { error: "Please answer the question about what your app does." },
      { status: 400 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      // Adaptive thinking shares this budget with the output. The JSON answer is
      // small, but reasoning needs room — too low a cap truncates the response.
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      output_config: {
        // This is a well-scoped judgment task — low effort keeps latency to a
        // few seconds (the brief's promise) without hurting answer quality.
        effort: "low",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      messages: [{ role: "user", content: buildUserMessage(answers) }],
    });

    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "We couldn't analyze that input. Try rephrasing your answers." },
        { status: 422 }
      );
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    // Empty text or a max_tokens stop means the answer was cut off or never
    // produced — that's distinct from a malformed request, so say so.
    if (!text || message.stop_reason === "max_tokens") {
      console.error(
        "[VibeCheck] incomplete model response, stop_reason:",
        message.stop_reason
      );
      return NextResponse.json(
        { error: "The analysis didn't finish. Please try again." },
        { status: 502 }
      );
    }

    const parsed = extractJson(text);
    if (!isValidDiagnosis(parsed)) {
      throw new Error("Model returned an unexpected shape");
    }

    return NextResponse.json(parsed satisfies Diagnosis);
  } catch (err) {
    // Preserve the upstream status so the client can react (e.g. back off on a
    // 429 instead of hammering Retry).
    if (err instanceof Anthropic.APIError) {
      const status = err.status ?? 502;
      console.error("[VibeCheck] Anthropic API error:", status, err.message);
      const message =
        status === 429
          ? "We're getting a lot of requests right now. Try again in a moment."
          : "Something went wrong while analyzing your app.";
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[VibeCheck] diagnosis failed:", err);
    return NextResponse.json(
      { error: "Something went wrong while analyzing your app." },
      { status: 500 }
    );
  }
}
