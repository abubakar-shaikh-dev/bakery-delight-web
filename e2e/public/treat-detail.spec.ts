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
    // The price line leads with the "from" price; the sizes list repeats it.
    await expect(page.getByText("₹499")).toHaveCount(2);
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

  test("sizes render as a picker and carry into the order message", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");

    const sizes = page.getByRole("group", { name: "Sizes" });
    await expect(sizes.getByRole("button", { name: /500 g/ })).toBeVisible();
    await expect(sizes.getByRole("button", { name: /1 kg/ })).toBeVisible();

    // Choosing a size pins the exact price and names it in the message.
    await sizes.getByRole("button", { name: /1 kg/ }).click();
    await expect(
      page.locator("p").filter({ hasText: /^₹899$/ }),
    ).toBeVisible();
    await expect(page.getByText("onwards")).toHaveCount(0);

    const cta = page.locator('a[href*="wa.me"][href*="Truffle%20Tower"]');
    await expect(cta).toHaveAttribute(
      "href",
      /Truffle%20Tower%20\(1%20kg\)/,
    );
  });

  test("extra photos swap the main image from the thumbnail strip", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");

    const strip = page.getByRole("group", { name: "Truffle Tower photos" });
    const thumbs = strip.getByRole("button");
    await expect(thumbs).toHaveCount(2);

    const main = page.getByRole("img", { name: "Truffle Tower" });
    const before = await main.getAttribute("src");
    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute("aria-pressed", "true");
    expect(await main.getAttribute("src")).not.toBe(before);
  });

  test("a review linked to the treat shows with its star summary", async ({
    page,
  }) => {
    await page.goto("/treats/truffle-tower");

    await expect(
      page.getByRole("heading", { name: "What people say" }),
    ).toBeVisible();
    await expect(page.getByText("Asha Verma")).toBeVisible();
    await expect(page.getByText("1 review for this treat")).toBeVisible();
  });

  test("a treat without its own reviews falls back to featured ones", async ({
    page,
  }) => {
    await page.goto("/treats/kulfi-dream");

    await expect(
      page.getByRole("heading", { name: "What people say" }),
    ).toBeVisible();
    await expect(page.getByText("Asha Verma")).toBeVisible();
    // The fallback carries no treat-specific star summary.
    await expect(page.getByText("for this treat")).toHaveCount(0);
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

    // Scoped to the related section — review cards are articles too.
    const related = page
      .locator("section")
      .filter({ hasText: "More from the oven" })
      .getByRole("article");
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
