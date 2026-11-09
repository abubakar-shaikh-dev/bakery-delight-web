import { absoluteUrl } from "./site-url";
import { treatFromPrice } from "./utils";
import type { SettingsData, TreatData } from "./site-data";

/**
 * JSON-LD structured data builders — only schemas relevant to each page's
 * detected type (per .agent/skills/nextjs-seo-audit → schema-json-optimization):
 * Bakery on pages with contact signals, Product + BreadcrumbList on treat
 * detail pages. Render with <script type="application/ld+json">.
 */

/** The bakery as a LocalBusiness — home and contact pages. */
export function bakerySchema(settings: SettingsData): object {
  const sameAs = Object.values(settings.socials).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: settings.bakeryName,
    url: absoluteUrl(),
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    image: absoluteUrl("/og-default.jpg"),
    priceRange: "₹₹",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** A treat as a Product — treat detail pages. Offers only when priced.
    `rating` comes from this treat's own reviews only; site-wide numbers
    must never describe a single product. */
export function productSchema(
  treat: TreatData,
  rating?: { total: number; avg: number },
): object {
  const toAbsolute = (url: string) =>
    url.startsWith("http") ? url : absoluteUrl(url);
  const images = [treat.image, ...treat.images].filter(Boolean).map(toAbsolute);
  const fromPrice = treatFromPrice(treat.price, treat.variants);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: treat.name,
    description: treat.description || treat.tagline,
    ...(images.length > 0 ? { image: images } : {}),
    ...(rating && rating.total > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.avg,
            reviewCount: rating.total,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(fromPrice !== null
      ? {
          offers: {
            "@type": "Offer",
            price: fromPrice,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(`/treats/${treat.slug}`),
          },
        }
      : {}),
  };
}

/** Breadcrumb trail — pages with a breadcrumb nav (treat detail). */
export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serialises a schema for the ld+json script tag. */
export function jsonLd(schema: object): string {
  return JSON.stringify(schema);
}
