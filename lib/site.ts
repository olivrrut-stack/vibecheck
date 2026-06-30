// Single source of truth for the canonical site origin. Used by metadata,
// sitemap, robots, manifest, and JSON-LD so they never drift. Override with
// NEXT_PUBLIC_SITE_URL (e.g. preview deploys); defaults to production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://vibecheckhq.app";
