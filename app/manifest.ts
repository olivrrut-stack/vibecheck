import type { MetadataRoute } from "next";

// Web app manifest: lets the site install to a home screen and gives crawlers a
// clean name/description/theme. Icons reuse the auto-served app/icon.svg.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VibeCheck: App rejection risk checker",
    short_name: "VibeCheck",
    description:
      "Find out if your AI-built app or game will get rejected by Apple before you submit.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
