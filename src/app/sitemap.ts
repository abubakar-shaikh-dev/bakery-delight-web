import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_PAGES } from "@/lib/site-pages";
import { getAllTreatSlugs } from "@/lib/site-data";

/**
 * Static pages come from the site-pages registry (add a page there and it
 * lands here automatically); treat detail URLs come from the database.
 * Admin and API routes are deliberately excluded (see robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = Object.values(SITE_PAGES).map((page) => ({
    url: absoluteUrl(page.path === "/" ? "" : page.path),
    changeFrequency: "weekly" as const,
    priority: page.path === "/" ? 1 : 0.7,
  }));

  const treats = (await getAllTreatSlugs()).map((t) => ({
    url: absoluteUrl(`/treats/${t.slug}`),
    lastModified: t.updatedAt ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...statics, ...treats];
}
