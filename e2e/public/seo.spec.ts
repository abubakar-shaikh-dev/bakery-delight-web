import { test, expect } from "../support/fixtures";
import { seedDb } from "../support/db";
import { envLocal } from "../support/env";

/**
 * The .agent/skills/nextjs-seo-audit checklists, enforced per page:
 * meta-data-optimization (title/description/OG/Twitter), technical-seo
 * (canonical, sitemap, robots, noindex) and schema-json-optimization
 * (relevant JSON-LD only). The site URL under test is NEXT_PUBLIC_SITE_URL
 * from .env.local — the declared source of truth, not the serving port.
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
    });
  }
});

test.describe("SEO — technical", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("sitemap.xml lists static pages and treats, never admin", async ({
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
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/api/");
  });

  test("robots.txt disallows admin/api and points at the sitemap", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api");
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
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

  async function schemas(page: import("@playwright/test").Page) {
    const tags = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const parsed: Array<Record<string, unknown>> = [];
    for (const tag of tags) {
      parsed.push(JSON.parse((await tag.textContent()) ?? "{}"));
    }
    return parsed;
  }

  test("home and contact carry the Bakery (LocalBusiness) schema", async ({
    page,
  }) => {
    for (const path of ["/", "/contact"]) {
      await page.goto(path);
      const found = await schemas(page);
      const bakery = found.find((s) => s["@type"] === "Bakery");
      expect(bakery, `Bakery schema on ${path}`).toBeTruthy();
      expect(bakery!["name"]).toBe("Bakery Delight");
      expect(bakery!["url"]).toBe(SITE);
      expect(bakery!["telephone"]).toBeTruthy();
      expect(bakery!["address"]).toBeTruthy();
    }
  });

  test("treat detail carries Product and BreadcrumbList schemas", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");

    const found = await schemas(page);
    const product = found.find((s) => s["@type"] === "Product");
    expect(product).toBeTruthy();
    expect(product!["name"]).toBe("Truffle Tower");
    const offers = product!["offers"] as Record<string, unknown>;
    expect(offers["price"]).toBe(499);
    expect(offers["priceCurrency"]).toBe("INR");

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
