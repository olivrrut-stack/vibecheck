import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Lets search engines crawl the public marketing pages while keeping the API and
// the private/utility pages out. Note: /result is intentionally NOT disallowed —
// those pages carry a noindex meta tag, and a page must be crawlable for the
// crawler to actually see that tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/reports", "/unlock"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
