import { ImageResponse } from "next/og";
import { VERDICT, clampScoreToLevel, isRiskLevel } from "@/lib/verdict";

// Query-driven share card: /api/og?level=&score=&track=. Used by the result
// page's metadata so a shared game result previews dark + green (and app stays
// light + blue), letting you tell them apart from the link thumbnail alone.
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("level") || "").toUpperCase();
  const level = isRiskLevel(raw) ? raw : "MEDIUM";
  const score = clampScoreToLevel(
    level,
    parseInt(searchParams.get("score") || "0", 10) || 0
  );
  const v = VERDICT[level];
  const dark = searchParams.get("track") === "game";

  const bg = dark ? "#0b0b0d" : "#ffffff";
  const ink = dark ? "#f5f5f7" : "#1d1d1f";
  const muted = dark ? "#a8a8b3" : "#6e6e73";
  const iconGrad = dark
    ? "linear-gradient(160deg, #4ade80 0%, #22c55e 50%, #15803d 100%)"
    : "linear-gradient(160deg, #4aa3ff 0%, #0a84ff 50%, #0050d6 100%)";
  const noun = dark ? "Game" : "App";
  // Brighter risk colors on the dark card so the score and pill read clearly.
  const scoreColor = dark
    ? { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#f43f5e" }[level]
    : v.colorHex;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bg,
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "76px",
              height: "76px",
              borderRadius: "18px",
              backgroundImage: iconGrad,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "42px", fontWeight: 700, color: ink }}>
            VibeCheck
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "26px", letterSpacing: "4px", color: muted }}>
            {noun.toUpperCase()} REJECTION RISK
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", marginTop: "8px" }}>
            <div style={{ display: "flex", fontSize: "180px", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
              {String(score)}
            </div>
            <div style={{ display: "flex", fontSize: "56px", color: muted, paddingBottom: "26px" }}>
              / 100
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "40px",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: scoreColor,
                padding: "12px 36px",
                borderRadius: "999px",
              }}
            >
              {v.pill}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "30px", color: muted }}>
          Check your AI-built {noun.toLowerCase()} free at VibeCheck
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
