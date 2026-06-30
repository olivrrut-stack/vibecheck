import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The indexable surface: the two checker landing pages plus the legal pages.
// Private/utility routes and the thin /result share pages are intentionally
// excluded (they're handled by robots.ts disallow / noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly"
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry("", 1, "weekly"),
    entry("/games", 0.9, "weekly"),
    entry("/listing", 0.8, "monthly"),
    entry("/privacy", 0.3, "monthly"),
    entry("/terms", 0.3, "monthly"),
    entry("/refund", 0.3, "monthly"),
  ];
}
