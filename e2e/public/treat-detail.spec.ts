import { test, expect } from "../support/fixtures";
import { seedDb } from "../support/db";

test.describe("treat detail page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("renders the full detail for a treat with every field", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Truffle Tower",
    );
    await expect(page.getByText("Test Cakes").first()).toBeVisible();
    await expect(page.getByText("A tower of dark truffles")).toBeVisible();
    await expect(page.getByText("₹499")).toBeVisible();
    await expect(page.getByText("onwards")).toBeVisible();

    // Spec card — both optional fields present.
    await expect(page.getByText("Weight", { exact: true })).toBeVisible();
    await expect(page.getByText("750 g")).toBeVisible();
    await expect(page.getByText("Serves", { exact: true })).toBeVisible();
    await expect(page.getByText("10–12 people")).toBeVisible();

    // Breadcrumb names the hierarchy.
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Truffle Tower"),
    ).toBeVisible();

    // The order CTA carries the standard pre-filled message.
    const cta = page.locator('a[href*="wa.me"][href*="Truffle%20Tower"]');
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/919876543210\?text=/,
    );
  });

  test("a partially filled treat shows only its weight", async ({ page }) => {
    await page.goto("/treats/kulfi-dream");
    await expect(page.getByText("200 g")).toBeVisible();
    await expect(page.getByText("Serves", { exact: true })).toHaveCount(0);
  });

  test("a treat with no optional fields hides the spec card", async ({
    page,
  }) => {
    await page.goto("/treats/plain-batch");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Plain Batch",
    );
    // No price, no spec rows.
    await expect(page.getByText("onwards")).toHaveCount(0);
    await expect(page.getByText("Weight", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Serves", { exact: true })).toHaveCount(0);
    // Description still renders.
    await expect(page.getByText(/Fixture treat Plain Batch/)).toBeVisible();
  });

  test("related treats lead with the same category and link onward", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");
    await expect(
      page.getByRole("heading", { name: "More from the oven" }),
    ).toBeVisible();

    const related = page.getByRole("article");
    await expect(related).toHaveCount(4);
    // Same-category treats sort first (menu order, featured-first).
    await expect(related.first()).toContainText("Kulfi Dream");
    await expect(
      related.first().getByRole("link", { name: "Kulfi Dream", exact: true }),
    ).toHaveAttribute("href", "/treats/kulfi-dream");
  });

  test("listing cards navigate to the detail page", async ({ page }) => {
    await page.goto("/treats");
    await page
      .getByRole("link", { name: "Kulfi Dream", exact: true })
      .click();
    await expect(page).toHaveURL(/\/treats\/kulfi-dream$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Kulfi Dream",
    );
  });

  test("homepage strip cards reach the detail page", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/treats/truffle-tower"]').click();
    await expect(page).toHaveURL(/\/treats\/truffle-tower$/);
  });

  test("an unknown slug renders the custom 404", async ({ page }) => {
    await page.goto("/treats/never-baked");
    await expect(page.getByText("Fresh out of the oven, not the menu")).toBeVisible();
  });

  test("has no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/treats/truffle-tower");
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
