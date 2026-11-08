import { test, expect } from "../support/fixtures";
import { seedDb, FIX } from "../support/db";

test.describe("treats page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("lists the menu with a live count and appends more on scroll", async ({
    page,
  }) => {
    await page.goto("/treats");

    // 10 seeded treats, page size 8 — the count reflects the full total.
    await expect(page.getByText("10 delights")).toBeVisible();
    const first = page.getByRole("article").first();
    await expect(first).toContainText(FIX.featuredTreat); // featured sorts first
    await expect(page.getByRole("article")).toHaveCount(8);

    // Infinite scroll appends the remaining two and shows the end marker.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(
      page.getByText(/That’s every treat on the menu — for now/),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(10);
  });

  test("debounced search narrows the menu and can be cleared", async ({
    page,
  }) => {
    await page.goto("/treats");
    const input = page.getByRole("searchbox", { name: "Search treats" });
    await input.fill(FIX.searchWord);

    // 350ms debounce — the no-result flash must not appear before it fires.
    await expect(page.getByText("1 delight")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(
      page.getByRole("article").filter({ hasText: FIX.searchableTreat }),
    ).toBeVisible();

    const clear = page.getByRole("button", { name: "Clear search" });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(page.getByText("10 delights")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(8);
  });

  test("unknown search shows the no-results state with a reset", async ({
    page,
  }) => {
    await page.goto("/treats");
    await page
      .getByRole("searchbox", { name: "Search treats" })
      .fill("zzzznothing");
    await expect(page.getByText("Nothing for “zzzznothing” yet")).toBeVisible();
    await page.getByRole("button", { name: "Show everything" }).click();
    await expect(page.getByText("10 delights")).toBeVisible();
  });

  test("category chips filter, toggle off and show empty states", async ({
    page,
  }) => {
    await page.goto("/treats");
    const cookieChip = page.getByRole("button", { name: FIX.freeCategory });
    await cookieChip.click();
    await expect(cookieChip).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("5 delights")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(5);

    // Clicking the active chip deselects it.
    await cookieChip.click();
    await expect(cookieChip).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText("10 delights")).toBeVisible();

    await page.getByRole("button", { name: FIX.emptyCategory }).click();
    await expect(
      page.getByText("No treats in this category yet"),
    ).toBeVisible();
  });

  test("cards link out to WhatsApp with a prefilled order text", async ({
    page,
  }) => {
    await page.goto("/treats");
    const card = page.getByRole("article").filter({ hasText: FIX.featuredTreat });
    const link = card.getByRole("link", { name: "Order on WhatsApp" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/919876543210\?text=.*Truffle%20Tower/,
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("price pill renders for priced treats and not for unpriced ones", async ({
    page,
  }) => {
    await page.goto("/treats");
    // Plain Batch sits on the second page — load everything first.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(
      page.getByText(/That’s every treat on the menu — for now/),
    ).toBeVisible();

    const truffle = page
      .getByRole("article")
      .filter({ hasText: FIX.featuredTreat });
    await expect(truffle.getByText("₹499")).toBeVisible();

    const plain = page
      .getByRole("article")
      .filter({ hasText: FIX.noPriceTreat });
    await expect(plain).toBeVisible();
    await expect(plain.getByText(/₹/)).toHaveCount(0);
  });

  test("has no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/treats");
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
