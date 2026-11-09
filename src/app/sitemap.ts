import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_PAGES } from "@/lib/site-pages";
import { getAllTreatSlugs, getGallery } from "@/lib/site-data";

/**
 * Static pages come from the site-pages registry (add a page there and it
 * lands here automatically); treat detail URLs come from the database, each
 * with its photos as Google image-sitemap entries, and the gallery page
 * lists its photos the same way. Admin and API routes are deliberately
 * excluded (see robots.ts).
 */
// Rebuilt per request: the owner adds treats through the admin panel, and a
// build-time snapshot would go stale until the next deploy.
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const toAbsolute = (url: string) =>
    url.startsWith("http") ? url : absoluteUrl(url);

  const [treats, galleryImages] = await Promise.all([
    getAllTreatSlugs(),
    getGallery(50),
  ]);

  const statics = Object.values(SITE_PAGES).map((page) => ({
    url: absoluteUrl(page.path === "/" ? "" : page.path),
    changeFrequency: "weekly" as const,
    priority: page.path === "/" ? 1 : 0.7,
    // The gallery page doubles as the image sitemap entry for its photos.
    ...(page.path === "/gallery" && galleryImages.length > 0
      ? { images: galleryImages.map((g) => toAbsolute(g.url)) }
      : {}),
  }));

  const treatEntries = treats.map((t) => {
    const images = [t.image, ...t.images].filter(Boolean).map(toAbsolute);
    return {
      url: absoluteUrl(`/treats/${t.slug}`),
      lastModified: t.updatedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(images.length > 0 ? { images } : {}),
    };
  });

  return [...statics, ...treatEntries];
}
