import CheckerExperience from "@/components/CheckerExperience";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

// SoftwareApplication structured data so search engines understand what this is
// (a free developer tool with a paid tier) and can show rich results.
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VibeCheck",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Check whether your AI-built app will be rejected by Apple before you submit. Answer 6 questions and get your App Store rejection risk, the guidelines you're likely to trip, and why.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free rejection-risk check",
    },
    {
      "@type": "Offer",
      price: "5",
      priceCurrency: "USD",
      description: "Deep fix report",
    },
  ],
  publisher: { "@type": "Organization", name: "VibeCheck", url: SITE_URL },
};

// App-dev track (light theme). The whole experience lives in CheckerExperience,
// shared with the game-dev track at /games.
export default function Home() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <CheckerExperience track="app" />
    </>
  );
}
