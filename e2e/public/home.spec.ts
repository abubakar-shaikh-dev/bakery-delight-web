import { test, expect } from "../support/fixtures";
import { seedDb, FIX } from "../support/db";

test.describe("home page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("renders the hero with both CTAs and the review badge", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Happiness",
    );
    await expect(page.getByText("Tastes Better")).toBeVisible();

    const orderCake = page.getByRole("link", { name: "Order a Cake" });
    await expect(orderCake).toHaveAttribute("href", "/contact");
    const explore = page.getByRole("link", { name: "Explore Treats" });
    await expect(explore).toHaveAttribute("href", "/treats");

    // Avg of the two approved seed reviews is 4.5.
    await expect(page.getByText("4.5 from real orders")).toBeVisible();
  });

  test("features the marked treat with a View All link", async ({ page }) => {
    await page.goto("/");
    const strip = page.getByRole("heading", { name: "Our Treats" });
    await expect(strip).toBeVisible();

    const card = page.getByRole("heading", { name: FIX.featuredTreat });
    await expect(card.first()).toBeVisible();

    const viewAll = page.getByRole("link", { name: "View All", exact: true });
    await expect(viewAll).toHaveAttribute("href", "/treats");
  });

  test("shows featured approved testimonials, not pending ones", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "What Our Customers Say" }),
    ).toBeVisible();
    await expect(page.getByText("Asha Verma")).toBeVisible();
    await expect(page.getByText("Rohit Menon")).toBeHidden();
    await expect(page.getByText("Pending Person")).toBeHidden();

    const viewAll = page.getByRole("link", { name: "View All Reviews" });
    await expect(viewAll).toHaveAttribute("href", "/reviews");
  });

  test("shows the gallery section and the closing CTA band", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Gallery photo 1").first()).toBeAttached();

    const band = page.locator("#order");
    await band.scrollIntoViewIfNeeded();
    await expect(
      band.getByRole("heading", { name: "Ready to Add Sweetness to Your Day?" }),
    ).toBeVisible();
    await expect(
      band.getByRole("link", { name: "Order Now" }),
    ).toHaveAttribute("href", "/contact");
  });

  test("has no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        })),
      )
      .toEqual({ scroll: 375, client: 375 });
  });
});
