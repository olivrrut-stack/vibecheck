import type { Metadata } from "next";
import CheckerExperience from "@/components/CheckerExperience";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "VibeCheck for games: App Store rejection risk checker",
  description:
    "Find out if your AI-built game will get rejected before Apple does. Free check, with deep fixes for $7.99. IP, loot boxes, gambling, kids, and more.",
  alternates: { canonical: "/games" },
};

const gameJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VibeCheck for games",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/games`,
  description:
    "Check whether your AI-built game will be rejected by Apple before you submit. Covers intellectual property, loot box odds, gambling, kids, and in-app purchases.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free rejection-risk check",
    },
    {
      "@type": "Offer",
      price: "7.99",
      priceCurrency: "USD",
      description: "Deep fix report",
    },
  ],
  publisher: { "@type": "Organization", name: "VibeCheck", url: SITE_URL },
};

// Game-dev track (dark theme). The data-track wrapper flips the color tokens and
// darkens the page background so the whole checker reuses as-is.
export default function GamesPage() {
  return (
    // bg-canvas (the dark token, scoped here) covers the viewport even if a
    // browser lacks :has() support, so no white edge shows on overscroll.
    <div data-track="game" className="min-h-dvh bg-canvas">
      <JsonLd data={gameJsonLd} />
      <CheckerExperience track="game" />
    </div>
  );
}
