import { ImageResponse } from "next/og";

// Social share card. Mirrors the in-app brand (dark canvas, gradient squircle,
// the verdict pill) so a shared link previews as the App Store listing concept.
export const alt = "VibeCheck — App Store rejection risk checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(1100px 600px at 50% -20%, rgba(120,130,160,0.18), transparent 70%)",
          padding: "72px",
          color: "#ececee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "27px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage:
                "linear-gradient(160deg, #4aa3ff 0%, #0a84ff 50%, #0050d6 100%)",
            }}
          >
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="white"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "64px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              VibeCheck
            </div>
            <div style={{ fontSize: "28px", color: "#0a84ff" }}>
              App Store Rejection Risk Checker
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ fontSize: "52px", fontWeight: 700, lineHeight: 1.15, maxWidth: "900px" }}>
            Will Apple reject your AI-built app?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: 600,
                color: "#0a0a0b",
                backgroundColor: "#37c871",
                padding: "12px 36px",
                borderRadius: "999px",
              }}
            >
              Looks Clear
            </div>
            <div style={{ fontSize: "26px", color: "#8a8a93" }}>
              Free · No account · Answer 5 questions
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
