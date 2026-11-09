import { SITE_PAGES } from "@/lib/site-pages";
import { absoluteUrl } from "@/lib/site-url";

/**
 * llms.txt (llmstxt.org): a curated plain-text map of the site for AI
 * agents. Built from the SITE_PAGES registry so every URL follows
 * NEXT_PUBLIC_SITE_URL — no hardcoded domain, same rule as sitemap.ts.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const lines = [
    "# Bakery Delight",
    "",
    "> Homemade cakes, cupcakes and treats baked to order in a one-person home kitchen. Visitors browse the menu, view the gallery, read customer reviews and order over WhatsApp or the contact form.",
    "",
    "Treat detail pages live under /treats/[slug]; slugs are linked from the treats page. All content is managed by the owner in a private admin panel.",
    "",
    "## Pages",
    "",
    ...Object.values(SITE_PAGES).map(
      (page) =>
        `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`,
    ),
    "",
    "## Machine-readable",
    "",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Treats JSON: ${absoluteUrl("/api/treats")}`,
    `- Reviews JSON: ${absoluteUrl("/api/reviews")}`,
    `- Gallery JSON: ${absoluteUrl("/api/gallery")}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
