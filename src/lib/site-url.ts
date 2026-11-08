/**
 * The site's public URL — the single source of truth for canonical tags,
 * Open Graph URLs and sitemap.xml. Comes from NEXT_PUBLIC_SITE_URL in
 * .env.local (set it to the production domain when deployed); the
 * localhost fallback keeps local dev working without configuration.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

/** Absolute URL for a path ("", "/treats" → SITE_URL, SITE_URL/treats). */
export function absoluteUrl(path = ""): string {
  return `${SITE_URL}${path}`;
}
