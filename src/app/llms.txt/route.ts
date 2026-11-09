import { SITE_PAGES } from "@/lib/site-pages";
import { absoluteUrl } from "@/lib/site-url";
import { getSettings, getTreatsPage } from "@/lib/site-data";
import { treatFromPrice, waLink } from "@/lib/utils";

/**
 * llms.txt (llmstxt.org): a curated plain-text map of the site for AI
 * assistants — what the bakery is, how ordering works and which pages carry
 * which answers. Built from the SITE_PAGES registry and the live menu so
 * every URL follows NEXT_PUBLIC_SITE_URL — no hardcoded domain, same rule
 * as sitemap.ts. Full page content lives in /llms-full.txt.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, menu] = await Promise.all([
    getSettings(),
    getTreatsPage("", "", 100, 0),
  ]);

  const pages = Object.values(SITE_PAGES).map((page) => ({
    label: page.path === "/" ? "Home" : page.title,
    url: absoluteUrl(page.path),
    note: page.description,
  }));

  const treatLines = menu.treats.map((t) => {
    const from = treatFromPrice(t.price, t.variants);
    const price =
      from === null
        ? "price on request"
        : `from ₹${from}` +
          (t.variants.length > 0
            ? ` (sizes: ${t.variants.map((v) => `${v.label} ₹${v.price}`).join(", ")})`
            : "");
    return `- [${t.name}](${absoluteUrl(`/treats/${t.slug}`)}): ${price} — ${t.tagline || t.description}`;
  });

  const lines = [
    "# Bakery Delight",
    "",
    "> Homemade cakes, cupcakes, cookies, brownies and seasonal specials, baked to order in a one-person home kitchen. Customers browse the menu and order over WhatsApp or the contact form — there is no online cart. Prices are in Indian rupees.",
    "",
    "## How ordering works",
    "",
    ...(settings.whatsappDigits
      ? [
          `- WhatsApp: ${settings.whatsappNumber} — order link: ${waLink(settings.whatsappDigits)}`,
        ]
      : []),
    `- Contact form: ${absoluteUrl("/contact")}`,
    "- The bakery replies within a day; every treat is baked fresh to order in the home kitchen.",
    "",
    "## Pages",
    "",
    ...pages.map((p) => `- [${p.label}](${p.url}): ${p.note}`),
    "",
    "## Treats",
    "",
    ...treatLines,
    "",
    "## Machine-readable",
    "",
    `- Sitemap (with image entries): ${absoluteUrl("/sitemap.xml")}`,
    `- llms-full.txt: ${absoluteUrl("/llms-full.txt")} — full catalogue, reviews and contact details in one document`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
