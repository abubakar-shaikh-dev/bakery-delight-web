import { absoluteUrl, SITE_URL } from "./site-url";
import { SITE_PAGES, type SitePage } from "./site-pages";
import { waLink } from "./utils";
import type {
  GalleryData,
  SettingsData,
  TreatData,
} from "./site-data";

/**
 * JSON-LD structured data as one connected @graph per page — every entity
 * gets a stable @id (the bakery, the website, the page, its breadcrumb) so
 * search engines and AI assistants resolve them as one site instead of
 * isolated fragments. Only schema types relevant to each page are emitted
 * (per .agent/skills/nextjs-seo-audit → schema-json-optimization):
 *
 *  - home        Bakery + WebSite (with SearchAction → /treats?q=)
 *  - treats      CollectionPage + ItemList + BreadcrumbList
 *  - gallery     CollectionPage + ItemList of ImageObject + BreadcrumbList
 *  - about       AboutPage (+ Bakery) + BreadcrumbList
 *  - reviews     WebPage + BreadcrumbList (no Review markup: Google excludes
 *                a business's own reviews from its site as "self-serving",
 *                so honest Product aggregateRatings live on treat pages only)
 *  - contact     ContactPage + Bakery + FAQPage + BreadcrumbList
 *  - treat       Product (AggregateOffer, variants) + BreadcrumbList
 *
 * Render with <script type="application/ld+json"> via jsonLd().
 */

export interface FaqItem {
  q: string;
  a: string;
}

/** Entity ids — stable URIs so pages cross-reference the same nodes. */
const BAKERY_ID = absoluteUrl("/#bakery");
const WEBSITE_ID = absoluteUrl("/#website");

const toAbsolute = (url: string) =>
  url.startsWith("http") ? url : absoluteUrl(url);

const pageUrl = (path: string) => absoluteUrl(path === "/" ? "" : path);

/** The page's rendered <title> — registry copy, suffixed like pageMetadata. */
const pageTitle = (page: SitePage) =>
  page.path === "/" ? page.title : `${page.title} — Bakery Delight`;

/** Wraps nodes in the single @context + @graph document a page renders. */
function graph(nodes: object[]): object {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/* ------------------------------- entity nodes ------------------------------ */

/** The bakery as a LocalBusiness — the site's primary entity. */
function bakeryNode(settings: SettingsData): object {
  const sameAs = Object.values(settings.socials).filter(Boolean);
  return {
    "@id": BAKERY_ID,
    "@type": "Bakery",
    name: settings.bakeryName,
    slogan: settings.tagline || undefined,
    url: SITE_URL,
    image: [absoluteUrl("/og-default.jpg")],
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/navbar-logo.webp"),
      width: 465,
      height: 160,
    },
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    priceRange: "₹₹",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    // WhatsApp is the one ordering channel — surface it as an explicit
    // action so AI assistants can answer "how do I order".
    ...(settings.whatsappDigits
      ? {
          potentialAction: {
            "@type": "OrderAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: waLink(settings.whatsappDigits),
              inLanguage: "en",
            },
          },
        }
      : {}),
  };
}

/** The WebSite entity, with the treats search as a SearchAction. */
function websiteNode(): object {
  return {
    "@id": WEBSITE_ID,
    "@type": "WebSite",
    name: "Bakery Delight",
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": BAKERY_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/treats")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** The page itself, tied to the website and (where apt) the bakery. */
function webPageNode({
  path,
  type = "WebPage",
  name,
  description,
  aboutBakery = false,
  mainEntity,
}: {
  path: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  aboutBakery?: boolean;
  mainEntity?: object;
}): object {
  const url = pageUrl(path);
  return {
    "@id": `${url}#webpage`,
    "@type": type,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    ...(aboutBakery ? { about: { "@id": BAKERY_ID } } : {}),
    ...(mainEntity ? { mainEntity } : {}),
  };
}

/** BreadcrumbList — mirrors the visible breadcrumb nav exactly. */
function breadcrumbNode(
  path: string,
  items: Array<{ name: string; path: string }>,
): object {
  const url = pageUrl(path);
  return {
    "@id": `${url}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

/** The menu as an ItemList of treat links. */
function treatListNode(treats: TreatData[]): object {
  return {
    "@type": "ItemList",
    itemListElement: treats.map((treat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: treat.name,
      url: pageUrl(`/treats/${treat.slug}`),
    })),
  };
}

/** Gallery photos as ImageObjects — contentUrl is what Google Images reads. */
function galleryListNode(images: GalleryData[]): object {
  return {
    "@type": "ItemList",
    itemListElement: images.map((img, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ImageObject",
        contentUrl: toAbsolute(img.url),
        url: pageUrl("/gallery"),
        name: img.caption || undefined,
      },
    })),
  };
}

/** A treat as a Product. Sizes (variants), weight and serves become
    additionalProperty; the price is an AggregateOffer — the honest shape
    when sizes carry different prices. `rating` comes from this treat's own
    reviews only; site-wide numbers must never describe a single product. */
function productNode(
  treat: TreatData,
  settings: SettingsData,
  rating?: { total: number; avg: number },
): object {
  const url = pageUrl(`/treats/${treat.slug}`);
  const images = [treat.image, ...treat.images].filter(Boolean).map(toAbsolute);
  const prices = [
    ...(treat.price !== null && Number.isFinite(treat.price) && treat.price >= 0
      ? [treat.price]
      : []),
    ...treat.variants.map((v) => v.price).filter((p) => Number.isFinite(p) && p >= 0),
  ];
  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;
  return {
    "@id": `${url}#product`,
    "@type": "Product",
    name: treat.name,
    description: treat.description || treat.tagline,
    ...(images.length > 0 ? { image: images } : {}),
    brand: { "@type": "Brand", name: settings.bakeryName },
    category: treat.category || undefined,
    ...(treat.variants.length > 0 ||
    treat.weight ||
    treat.serves
      ? {
          additionalProperty: [
            ...treat.variants.map((v) => ({
              "@type": "PropertyValue",
              name: "Size",
              value: v.label,
            })),
            ...(treat.weight
              ? [{ "@type": "PropertyValue", name: "Weight", value: treat.weight }]
              : []),
            ...(treat.serves
              ? [{ "@type": "PropertyValue", name: "Serves", value: treat.serves }]
              : []),
          ],
        }
      : {}),
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
    ...(low !== null
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: low,
            ...(high !== null && high > low ? { highPrice: high } : {}),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };
}

/** FAQPage — mirrors the visible FAQ section word for word. */
function faqNode(path: string, faqs: FaqItem[]): object {
  const url = pageUrl(path);
  return {
    "@id": `${url}#faq`,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* ----------------------------- page composers ------------------------------ */

/** Home — the bakery and its website, including treats search. */
export function homeSchemaGraph(settings: SettingsData): object {
  return graph([bakeryNode(settings), websiteNode()]);
}

/** Treats index — the menu as a collection with its items. */
export function treatsIndexSchemaGraph(treats: TreatData[]): object {
  return graph([
    webPageNode({
      path: "/treats",
      type: "CollectionPage",
      name: pageTitle(SITE_PAGES.treats),
      description: SITE_PAGES.treats.description,
      mainEntity: treatListNode(treats),
    }),
    breadcrumbNode("/treats", [
      { name: "Home", path: "/" },
      { name: "Our Treats", path: "/treats" },
    ]),
  ]);
}

/** Gallery — photos as ImageObjects so Google Images can index them. */
export function gallerySchemaGraph(images: GalleryData[]): object {
  return graph([
    webPageNode({
      path: "/gallery",
      type: "CollectionPage",
      name: pageTitle(SITE_PAGES.gallery),
      description: SITE_PAGES.gallery.description,
      mainEntity: galleryListNode(images),
    }),
    breadcrumbNode("/gallery", [
      { name: "Home", path: "/" },
      { name: "Gallery", path: "/gallery" },
    ]),
  ]);
}

/** About — an AboutPage about the bakery. */
export function aboutSchemaGraph(): object {
  return graph([
    webPageNode({
      path: "/about",
      type: "AboutPage",
      name: pageTitle(SITE_PAGES.about),
      description: SITE_PAGES.about.description,
      aboutBakery: true,
    }),
    breadcrumbNode("/about", [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ]);
}

/** Reviews — page and breadcrumb only; the bakery's own reviews stay out of
    markup (Google calls self-site review aggregates "self-serving"). */
export function reviewsSchemaGraph(): object {
  return graph([
    webPageNode({
      path: "/reviews",
      name: pageTitle(SITE_PAGES.reviews),
      description: SITE_PAGES.reviews.description,
    }),
    breadcrumbNode("/reviews", [
      { name: "Home", path: "/" },
      { name: "Reviews", path: "/reviews" },
    ]),
  ]);
}

/** Contact — ContactPage about the bakery, plus its FAQ. */
export function contactSchemaGraph(
  settings: SettingsData,
  faqs: FaqItem[],
): object {
  return graph([
    webPageNode({
      path: "/contact",
      type: "ContactPage",
      name: pageTitle(SITE_PAGES.contact),
      description: SITE_PAGES.contact.description,
      aboutBakery: true,
    }),
    bakeryNode(settings),
    breadcrumbNode("/contact", [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
    faqNode("/contact", faqs),
  ]);
}

/** Treat detail — WebPage whose main entity is the Product, plus crumbs. */
export function treatSchemaGraph(
  treat: TreatData,
  settings: SettingsData,
  rating?: { total: number; avg: number },
): object {
  const url = pageUrl(`/treats/${treat.slug}`);
  return graph([
    webPageNode({
      path: `/treats/${treat.slug}`,
      name: `${treat.name} — Bakery Delight`,
      description: treat.tagline || treat.description.slice(0, 150),
      aboutBakery: true,
      mainEntity: { "@id": `${url}#product` },
    }),
    productNode(treat, settings, rating),
    breadcrumbNode(`/treats/${treat.slug}`, [
      { name: "Home", path: "/" },
      { name: "Treats", path: "/treats" },
      { name: treat.name, path: `/treats/${treat.slug}` },
    ]),
  ]);
}

/** Serialises a schema graph for the ld+json script tag. */
export function jsonLd(schema: object): string {
  return JSON.stringify(schema);
}
