import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ListingChecker from "@/components/ListingChecker";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "App Store listing checker: keyword stuffing and metadata rejections",
  description:
    "Paste your app name, subtitle, keywords, and description. Catch keyword stuffing, banned terms, and metadata mismatches before Apple rejects your listing.",
  alternates: { canonical: "/listing" },
};

const listingJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VibeCheck Listing Checker",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/listing`,
  description:
    "Check whether your App Store listing text will get rejected or penalised under Apple Guideline 2.3.1 before you submit.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free metadata check",
    },
  ],
  publisher: { "@type": "Organization", name: "VibeCheck", url: SITE_URL },
};

export default function ListingPage() {
  return (
    <>
      <JsonLd data={listingJsonLd} />
      <ListingChecker />
    </>
  );
}
