import { SITE_PAGES } from "@/lib/site-pages";
import { absoluteUrl } from "@/lib/site-url";
import {
  getGallery,
  getReviewsPage,
  getSettings,
  getTreatsPage,
} from "@/lib/site-data";
import { treatFromPrice } from "@/lib/utils";

/**
 * llms-full.txt — the llms.txt companion carrying the full site content in
 * one plain-text document: contact details, the complete treat catalogue
 * with prices and sizes, approved customer reviews and a photo index. AI
 * assistants that fetch a single page per site get everything here instead
 * of crawling JavaScript-rendered routes. Read from the same DB-backed
 * queries as the pages, so the fallback seed keeps it alive when MongoDB
 * is down.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, menu, reviews, gallery] = await Promise.all([
    getSettings(),
    getTreatsPage("", "", 100, 0),
    getReviewsPage(50, 0),
    getGallery(50),
  ]);

  const socials = Object.entries(settings.socials).filter(([, url]) => url);

  const treatSections = menu.treats.map((t) => {
    const from = treatFromPrice(t.price, t.variants);
    const photos = [t.image, ...t.images].filter(Boolean);
    return [
      `### ${t.name}`,
      `- Category: ${t.category}`,
      ...(t.tagline ? [`- Tagline: ${t.tagline}`] : []),
      ...(t.description ? [`- Description: ${t.description}`] : []),
      `- Price: ${
        from === null
          ? "on request"
          : `from ₹${from}` +
            (t.variants.length > 0
              ? ` (sizes: ${t.variants.map((v) => `${v.label} ₹${v.price}`).join(", ")})`
              : "")
      }`,
      ...(t.weight ? [`- Weight: ${t.weight}`] : []),
      ...(t.serves ? [`- Serves: ${t.serves}`] : []),
      `- Page: ${absoluteUrl(`/treats/${t.slug}`)}`,
      ...(photos.length > 0
        ? [`- Photos: ${photos.map((p) => (p.startsWith("http") ? p : absoluteUrl(p))).join(", ")}`]
        : []),
    ].join("\n");
  });

  const reviewLines = reviews.reviews.map((r) => {
    const source = r.socialUrl ? ` (${r.socialPlatform || "social"})` : "";
    return `- ${r.name} rated ${r.rating}/5${source}: "${r.text}"`;
  });

  const lines = [
    "# Bakery Delight — full site content for AI assistants",
    "",
    "> Homemade cakes, cupcakes, cookies, brownies and seasonal specials, baked to order in a one-person home kitchen. Customers order over WhatsApp or the contact form; there is no online cart. Prices are in Indian rupees.",
    "",
    `Retrieved: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Contact",
    "",
    `- Bakery: ${settings.bakeryName}`,
    `- Tagline: ${settings.tagline}`,
    ...(settings.phone ? [`- Phone: ${settings.phone}`] : []),
    ...(settings.whatsappNumber
      ? [
          `- WhatsApp: ${settings.whatsappNumber} (https://wa.me/${settings.whatsappDigits})`,
        ]
      : []),
    ...(settings.email ? [`- Email: ${settings.email}`] : []),
    ...(settings.address ? [`- Address: ${settings.address}`] : []),
    ...socials.map(
      ([label, url]) => `- ${label[0].toUpperCase()}${label.slice(1)}: ${url}`,
    ),
    "",
    "## How ordering works",
    "",
    "- Every treat is baked to order in the home kitchen; nothing is kept in stock.",
    "- Orders and enquiries happen over WhatsApp or the contact form; the bakery replies within a day.",
    "- Custom cakes (flavours, colours, messages) are made to order for celebrations.",
    "- Reviews on the site come from real customers and are approved by the owner before appearing.",
    "",
    "## Treat catalogue",
    "",
    ...treatSections,
    "",
    "## Customer reviews",
    "",
    ...(reviewLines.length > 0
      ? reviewLines
      : ["- No approved reviews yet."]),
    "",
    "## Gallery",
    "",
    ...(gallery.length > 0
      ? gallery.map(
          (g) => `- ${g.caption || "Untitled photo"} — ${g.url.startsWith("http") ? g.url : absoluteUrl(g.url)}`,
        )
      : ["- No photos yet."]),
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
    `- llms.txt: ${absoluteUrl("/llms.txt")}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
