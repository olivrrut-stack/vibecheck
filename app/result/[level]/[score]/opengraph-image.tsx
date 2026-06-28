import { ImageResponse } from "next/og";
import { VERDICT, isRiskLevel } from "@/lib/verdict";

// Dynamic share card: when a /result/<level>/<score> link is posted, the preview
// shows the app's score. This is the part that makes people click.
export const alt = "VibeCheck score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ level: string; score: string }>;
}) {
  const { level: levelRaw, score: scoreRaw } = await params;
  const level = decodeURIComponent(levelRaw).toUpperCase();
  const score = Math.max(0, Math.min(100, parseInt(scoreRaw, 10) || 0));
  const v = isRiskLevel(level) ? VERDICT[level] : VERDICT.MEDIUM;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
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
              backgroundImage:
                "linear-gradient(160deg, #4aa3ff 0%, #0a84ff 50%, #0050d6 100%)",
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
          <div style={{ display: "flex", fontSize: "42px", fontWeight: 700, color: "#1d1d1f" }}>
            VibeCheck
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "26px", letterSpacing: "4px", color: "#6e6e73" }}>
            APP STORE REJECTION RISK
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", marginTop: "8px" }}>
            <div style={{ display: "flex", fontSize: "180px", fontWeight: 800, color: v.colorHex, lineHeight: 1 }}>
              {String(score)}
            </div>
            <div style={{ display: "flex", fontSize: "56px", color: "#6e6e73", paddingBottom: "26px" }}>
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
                backgroundColor: v.colorHex,
                padding: "12px 36px",
                borderRadius: "999px",
              }}
            >
              {v.pill}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "30px", color: "#6e6e73" }}>
          Check your AI-built app free at VibeCheck
        </div>
      </div>
    ),
    size
  );
}
