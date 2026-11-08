import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";

/**
 * Registry of every public page's SEO metadata. One entry per route —
 * adding a page here gives it a sitemap entry, canonical URL, Open Graph
 * and Twitter tags through pageMetadata(). See AGENTS.md → SEO.
 *
 * Copy rules (enforced by e2e/public/seo.spec.ts and the
 * .agent/skills/nextjs-seo-audit skill):
 *  - `title` segments render as `${title} — Bakery Delight` (30–60 chars).
 *  - `description` stays within 120–160 characters.
 */
export interface SitePage {
  /** Route path — "/" for home. */
  path: string;
  /** Title segment without the brand suffix. */
  title: string;
  description: string;
}

export const SITE_PAGES: Record<string, SitePage> = {
  home: {
    path: "/",
    title: "Bakery Delight — Homemade Cakes, Happier Moments",
    description:
      "Delicious homemade cakes, cupcakes and treats, freshly baked to order in a small home kitchen — made with love for birthdays and every celebration.",
  },
  treats: {
    path: "/treats",
    title: "Our Treats — Cakes, Cupcakes & Cookies",
    description:
      "Browse the full menu of homemade cakes, cupcakes, cookies, brownies and seasonal specials — baked fresh to order and delivered with a personal touch.",
  },
  gallery: {
    path: "/gallery",
    title: "Gallery — Cakes & Celebrations",
    description:
      "A photo album from our home kitchen — celebration cakes, cupcakes, brownies and the happy moments they were baked for, straight from the oven.",
  },
  about: {
    path: "/about",
    title: "About Us — A Home Kitchen",
    description:
      "The story of Bakery Delight — one home kitchen, one oven and a whole lot of love, baking for birthdays and celebrations across the neighbourhood.",
  },
  reviews: {
    path: "/reviews",
    title: "Customer Reviews",
    description:
      "Real words from real orders — read what customers say about Bakery Delight's homemade cakes and treats, and share your own experience with us.",
  },
  contact: {
    path: "/contact",
    title: "Contact & Ordering",
    description:
      "Order a cake or say hello — message us on WhatsApp, call, email or send the contact form and we'll get back to you within a day.",
  },
};

const OG_IMAGE = { url: absoluteUrl("/og-default.jpg"), width: 1200, height: 630 };

/**
 * Standard page metadata: brand-suffixed title, canonical, Open Graph and
 * Twitter Card in one shot. The home page passes its full default title;
 * other pages pass the short segment and get the brand suffix appended.
 */
export function pageMetadata(page: SitePage): Metadata {
  const fullTitle =
    page.path === "/" ? page.title : `${page.title} — Bakery Delight`;
  const url = absoluteUrl(page.path === "/" ? "" : page.path);
  return {
    // Home's title is already the full brand title — bypass the layout
    // template so it isn't suffixed twice.
    title: { absolute: fullTitle },
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url,
      siteName: "Bakery Delight",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [OG_IMAGE.url],
    },
  };
}
