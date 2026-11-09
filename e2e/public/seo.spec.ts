import { test, expect } from "../support/fixtures";
import { seedDb } from "../support/db";
import { envLocal } from "../support/env";

/**
 * The .agent/skills/nextjs-seo-audit checklists, enforced per page:
 * meta-data-optimization (title/description/OG/Twitter/robots directives),
 * technical-seo (canonical, sitemap + image entries, robots + AI crawlers,
 * noindex, manifest, icons, llms.txt) and schema-json-optimization (one
 * connected @graph per page with only the types that page warrants).
 * The site URL under test is NEXT_PUBLIC_SITE_URL from .env.local — the
 * declared source of truth, not the serving port.
 */
const SITE = envLocal().NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const PAGES = [
  { path: "/", title: "Bakery Delight — Homemade Cakes, Happier Moments" },
  { path: "/treats", title: "Our Treats — Cakes, Cupcakes & Cookies — Bakery Delight" },
  { path: "/gallery", title: "Gallery — Cakes & Celebrations — Bakery Delight" },
  { path: "/about", title: "About Us — A Home Kitchen — Bakery Delight" },
  { path: "/reviews", title: "Customer Reviews — Bakery Delight" },
  { path: "/contact", title: "Contact & Ordering — Bakery Delight" },
];

test.describe("SEO — meta data on every public page", () => {
  for (const entry of PAGES) {
    test(`meta checklist: ${entry.path}`, async ({ page }) => {
      await seedDb();
      await page.goto(entry.path);

      // Title: 30–60 chars, exact copy from the registry.
      const title = await page.title();
      expect(title).toBe(entry.title);
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);

      // Description: 120–160 chars.
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThanOrEqual(120);
      expect(description!.length).toBeLessThanOrEqual(160);

      // Canonical: absolute, self-referencing, from the env URL.
      const expectedUrl = `${SITE}${entry.path === "/" ? "" : entry.path}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        expectedUrl,
      );

      // Googlebot directives: large image previews for Google Images and
      // unlimited snippets for AI answers.
      await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute(
        "content",
        /max-image-preview:large/,
      );
      await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute(
        "content",
        /max-snippet:-1/,
      );

      // The five required Open Graph tags (+ image dimensions).
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        title,
      );
      await expect(
        page.locator('meta[property="og:description"]'),
      ).toHaveAttribute("content", description!);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        expectedUrl,
      );
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        "content",
        "website",
      );
      await expect(page.locator('meta[property="og:image"]').first()).toBeAttached();
      await expect(
        page.locator('meta[property="og:image:width"]'),
      ).toHaveAttribute("content", "1200");
      await expect(
        page.locator('meta[property="og:image:height"]'),
      ).toHaveAttribute("content", "630");

      // Twitter Card tags.
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
        "content",
        title,
      );
      await expect(
        page.locator('meta[name="twitter:description"]'),
      ).toHaveAttribute("content", description!);

      // Browser chrome follows the brand background (cream-100).
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
        "content",
        "#fdf2ec",
      );
    });
  }
});

test.describe("SEO — technical", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("sitemap.xml lists static pages and treats, never admin/api pages", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");

    for (const path of [
      `${SITE}/`,
      `${SITE}/treats`,
      `${SITE}/gallery`,
      `${SITE}/about`,
      `${SITE}/reviews`,
      `${SITE}/contact`,
      `${SITE}/treats/truffle-tower`,
    ]) {
      expect(body).toContain(`<loc>${path.replace(/\/$/, "")}</loc>`);
    }
    // Page URLs never point at admin or API plumbing…
    expect(body).not.toContain("/admin");
    expect(body).not.toMatch(/<loc>[^<]*\/api\//);
  });

  test("sitemap.xml carries Google image entries for treat photos", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    const body = await res.text();
    // The image namespace + per-treat photo entries (DB-stored fixture
    // photos are served from /api/images in the test environment).
    expect(body).toContain("xmlns:image=");
    expect(body).toContain("<image:image>");
    expect(body).toContain("/api/images/");
    // The gallery page doubles as its photos' sitemap entry.
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/gallery<\/loc>[\s\S]*?<image:loc>/);
  });

  test("robots.txt disallows admin/api, allows image serving and AI crawlers", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api");
    // Content photos stay crawlable (DB storage serves them from /api/images).
    expect(body).toContain("Allow: /api/images/");
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    // The AI-search stance is explicit: every major assistant crawler is
    // named and allowed.
    for (const bot of [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
      "Applebot",
      "meta-externalagent",
    ]) {
      // Next serializes robots rules with a capital "Agent" — directives
      // are case-insensitive for crawlers either way.
      expect(body).toContain(`User-Agent: ${bot}`);
    }
  });

  test("llms.txt maps the site for AI assistants", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body).toContain("# Bakery Delight");
    expect(body).toContain("## How ordering works");
    expect(body).toContain(`https://wa.me/919876543210`);
    expect(body).toContain("## Pages");
    expect(body).toContain(`${SITE}/treats`);
    expect(body).toContain("## Treats");
    expect(body).toContain(`${SITE}/treats/truffle-tower`);
    expect(body).toContain("from ₹499");
    expect(body).toContain("/llms-full.txt");
    expect(body).toContain(`${SITE}/sitemap.xml`);
  });

  test("llms-full.txt carries the full catalogue, reviews and contact details", async ({
    request,
  }) => {
    const res = await request.get("/llms-full.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    // Contact details come from the settings the test seed plants.
    expect(body).toContain("12 Flour Lane, Mumbai");
    expect(body).toContain("hello@bakerydelight.test");
    expect(body).toContain("+91 98765 43210");
    // Catalogue: headline treat with both sizes and their prices.
    expect(body).toContain("### Truffle Tower");
    expect(body).toContain("from ₹499");
    expect(body).toContain("1 kg ₹899");
    expect(body).toContain(`${SITE}/treats/truffle-tower`);
    // Unpriced treats say so honestly.
    expect(body).toContain("Price: on request");
    // Only approved reviews appear.
    expect(body).toContain("Asha Verma rated 5/5");
    expect(body).not.toContain("Pending Person");
  });

  test("manifest, apple icon and favicon resolve", async ({ request }) => {
    const manifestRes = await request.get("/manifest.webmanifest");
    expect(manifestRes.status()).toBe(200);
    const manifest = (await manifestRes.json()) as {
      name: string;
      icons: Array<{ src: string; sizes: string }>;
    };
    expect(manifest.name).toContain("Bakery Delight");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of manifest.icons) {
      const iconRes = await request.get(icon.src);
      expect(iconRes.status()).toBe(200);
    }

    expect((await request.get("/apple-icon.png")).status()).toBe(200);
    expect((await request.get("/icon.png")).status()).toBe(200);
  });

  test("admin pages are noindex", async ({ page, request }) => {
    // The (dashboard) group's layout metadata applies to every admin page.
    const authed = await request.get("/admin");
    const html = await authed.text();
    expect(html).toContain("noindex");

    await page.goto("/admin/login");
    await expect(
      page.locator('meta[name="robots"]'),
    ).toHaveAttribute("content", /noindex/);
  });

  test("an unknown treat slug is noindexed in the served HTML", async ({
    request,
  }) => {
    // Dynamic pages stream, so notFound() can fire after the 200 shell —
    // crawlers judge by the served <head>, which is what we assert here.
    const res = await request.get("/treats/never-baked");
    const html = await res.text();
    expect(html).toContain("noindex");
    expect(html).toContain("noindex, nofollow");
  });
});

test.describe("SEO — JSON-LD schema", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  /** Every JSON-LD document on the page, flattened: @graph members and
      bare documents alike end up as one searchable list of nodes. */
  async function schemas(page: import("@playwright/test").Page) {
    const tags = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const parsed: Array<Record<string, unknown>> = [];
    for (const tag of tags) {
      const doc = JSON.parse((await tag.textContent()) ?? "{}") as Record<
        string,
        unknown
      >;
      if (Array.isArray(doc["@graph"])) {
        parsed.push(...(doc["@graph"] as Array<Record<string, unknown>>));
      } else {
        parsed.push(doc);
      }
    }
    return parsed;
  }

  test("home carries the Bakery and WebSite (with treats SearchAction)", async ({
    page,
  }) => {
    await page.goto("/");
    const found = await schemas(page);

    const bakery = found.find((s) => s["@type"] === "Bakery");
    expect(bakery, "Bakery schema on home").toBeTruthy();
    expect(bakery!["name"]).toBe("Bakery Delight");
    expect(bakery!["url"]).toBe(SITE);
    expect(bakery!["telephone"]).toBeTruthy();
    expect(bakery!["address"]).toBeTruthy();
    // The bakery's socials ride along as sameAs.
    expect(bakery!["sameAs"]).toContain("https://instagram.com/bakerydelight");
    // WhatsApp is the ordering channel — declared as an OrderAction.
    const order = bakery!["potentialAction"] as Record<string, unknown>;
    expect(order).toBeTruthy();
    expect((order["target"] as Record<string, unknown>)["urlTemplate"]).toContain(
      "wa.me/919876543210",
    );

    const website = found.find((s) => s["@type"] === "WebSite");
    expect(website).toBeTruthy();
    const search = website!["potentialAction"] as Record<string, unknown>;
    expect(search).toBeTruthy();
    expect((search["target"] as Record<string, unknown>)["urlTemplate"]).toBe(
      `${SITE}/treats?q={search_term_string}`,
    );
  });

  test("contact carries Bakery, ContactPage, breadcrumb and the FAQ", async ({
    page,
  }) => {
    await page.goto("/contact");
    const found = await schemas(page);

    const bakery = found.find((s) => s["@type"] === "Bakery");
    expect(bakery, "Bakery schema on contact").toBeTruthy();
    expect(bakery!["telephone"]).toBeTruthy();
    expect(bakery!["address"]).toBeTruthy();

    expect(found.find((s) => s["@type"] === "ContactPage")).toBeTruthy();

    const crumbs = found.find((s) => s["@type"] === "BreadcrumbList");
    expect(crumbs).toBeTruthy();
    const items = crumbs!["itemListElement"] as Array<{ name: string }>;
    expect(items.map((i) => i.name)).toEqual(["Home", "Contact"]);

    // FAQPage mirrors the visible FAQ section word for word.
    const faq = found.find((s) => s["@type"] === "FAQPage");
    expect(faq).toBeTruthy();
    const questions = faq!["mainEntity"] as Array<Record<string, unknown>>;
    expect(questions).toHaveLength(4);
    expect(questions[0]["name"]).toBe("How do I order a treat?");
    // And the visible section exists to match it.
    await expect(page.getByRole("heading", { name: "Before you ask" })).toBeVisible();
    await expect(page.getByText("How do I order a treat?")).toBeVisible();
  });

  test("treats index carries a CollectionPage with the menu as an ItemList", async ({
    page,
  }) => {
    await page.goto("/treats");
    const found = await schemas(page);

    const collection = found.find((s) => s["@type"] === "CollectionPage");
    expect(collection).toBeTruthy();
    const list = collection!["mainEntity"] as Record<string, unknown>;
    expect(list["@type"]).toBe("ItemList");
    const entries = list["itemListElement"] as Array<{
      name: string;
      url: string;
    }>;
    expect(entries[0]["name"]).toBe("Truffle Tower");
    expect(entries[0]["url"]).toBe(`${SITE}/treats/truffle-tower`);

    const crumbs = found.find((s) => s["@type"] === "BreadcrumbList");
    expect(crumbs).toBeTruthy();
    expect(
      (crumbs!["itemListElement"] as Array<{ name: string }>).map((i) => i.name),
    ).toEqual(["Home", "Our Treats"]);
  });

  test("gallery carries its photos as ImageObjects", async ({ page }) => {
    await page.goto("/gallery");
    const found = await schemas(page);

    const collection = found.find((s) => s["@type"] === "CollectionPage");
    expect(collection).toBeTruthy();
    const list = collection!["mainEntity"] as Record<string, unknown>;
    expect(list["@type"]).toBe("ItemList");
    const entries = list["itemListElement"] as Array<{
      item: Record<string, unknown>;
    }>;
    expect(entries.length).toBeGreaterThanOrEqual(12);
    for (const entry of entries.slice(0, 3)) {
      expect(entry.item["@type"]).toBe("ImageObject");
      expect(entry.item["contentUrl"]).toContain("/api/images/");
      expect(entry.item["name"]).toBeTruthy();
    }
  });

  test("about and reviews carry page + breadcrumb schema, never review stars", async ({
    page,
  }) => {
    await page.goto("/about");
    let found = await schemas(page);
    expect(found.find((s) => s["@type"] === "AboutPage")).toBeTruthy();
    expect(
      (found.find((s) => s["@type"] === "BreadcrumbList")![
        "itemListElement"
      ] as Array<{ name: string }>).map((i) => i.name),
    ).toEqual(["Home", "About"]);

    await page.goto("/reviews");
    found = await schemas(page);
    expect(found.find((s) => s["@type"] === "WebPage")).toBeTruthy();
    // A bakery marking up its own site-wide reviews is "self-serving" per
    // Google — aggregateRating belongs to Products only.
    expect(found.find((s) => s["@type"] === "AggregateRating")).toBeUndefined();
    expect(
      (found.find((s) => s["@type"] === "BreadcrumbList")![
        "itemListElement"
      ] as Array<{ name: string }>).map((i) => i.name),
    ).toEqual(["Home", "Reviews"]);
  });

  test("treat detail carries Product, breadcrumbs and the treat's own rating", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");
    const found = await schemas(page);

    const product = found.find((s) => s["@type"] === "Product");
    expect(product).toBeTruthy();
    expect(product!["name"]).toBe("Truffle Tower");
    expect(product!["brand"]).toEqual({ "@type": "Brand", name: "Bakery Delight" });

    // Sizes are declared, and the offer is an AggregateOffer spanning them.
    const props = product!["additionalProperty"] as Array<{
      name: string;
      value: string;
    }>;
    expect(props).toContainEqual({ "@type": "PropertyValue", name: "Size", value: "500 g" });
    expect(props).toContainEqual({ "@type": "PropertyValue", name: "Size", value: "1 kg" });

    const offers = product!["offers"] as Record<string, unknown>;
    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers["lowPrice"]).toBe(499);
    expect(offers["highPrice"]).toBe(899);
    expect(offers["priceCurrency"]).toBe("INR");

    // The star summary comes from this treat's linked reviews only.
    const rating = product!["aggregateRating"] as Record<string, unknown>;
    expect(rating).toBeTruthy();
    expect(rating["ratingValue"]).toBe(5);
    expect(rating["reviewCount"]).toBe(1);

    const crumbs = found.find((s) => s["@type"] === "BreadcrumbList");
    expect(crumbs).toBeTruthy();
    const items = crumbs!["itemListElement"] as Array<{
      name: string;
      item: string;
    }>;
    expect(items.map((i) => i.name)).toEqual([
      "Home",
      "Treats",
      "Truffle Tower",
    ]);
    expect(items[2].item).toBe(`${SITE}/treats/truffle-tower`);

    // The page node points at the product as its main entity.
    const webpage = found.find((s) => s["@type"] === "WebPage");
    expect(webpage).toBeTruthy();
    expect(webpage!["mainEntity"]).toEqual({ "@id": `${SITE}/treats/truffle-tower#product` });
  });

  test("the detail page's canonical and OG image follow the treat", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE}/treats/truffle-tower`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Truffle Tower — Bakery Delight",
    );
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    expect(ogImage).toContain("/api/images/");
  });
});
