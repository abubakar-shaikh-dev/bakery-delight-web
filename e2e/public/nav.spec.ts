import { test, expect } from "../support/fixtures";
import { seedDb } from "../support/db";

test.describe("site navigation & shell", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("desktop pill nav marks the active page", async ({ page }) => {
    await page.goto("/treats");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Treats", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      nav.getByRole("link", { name: "Home", exact: true }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("logo, header search and Order Now point at the right pages", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(page.getByRole("link", { name: "Bakery Delight — home" })).toHaveAttribute(
      "href",
      "/",
    );
    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("link", { name: "Search treats" }),
    ).toHaveAttribute("href", "/treats");
    await expect(
      banner.getByRole("link", { name: "Order Now" }),
    ).toHaveAttribute("href", "/contact");
  });

  test("mobile fullscreen menu opens, closes and navigates", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeHidden();

    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Treats/ })).toBeVisible();
    await expect(menu.getByRole("link", { name: /Gallery/ })).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await trigger.click();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();

    await trigger.click();
    await menu.getByRole("link", { name: /Gallery/ }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  });

  test("footer lists quick links, contact details and the copyright", async ({
    page,
  }) => {
    await page.goto("/about");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: "Our Treats", exact: true }),
    ).toBeVisible();
    await expect(footer.getByText("hello@bakerydelight.test")).toBeVisible();
    await expect(footer.getByText("+91 98765 43210")).toBeVisible();
    await expect(footer.getByText("12 Flour Lane, Mumbai")).toBeVisible();
    await expect(footer.getByText(/All rights reserved/)).toBeVisible();
  });

  test("unknown routes render the custom 404 with escape hatches", async ({
    page,
  }) => {
    await page.goto("/no-such-page");
    await expect(page.getByText("Fresh out of the oven, not the menu")).toBeVisible();
    await page.getByRole("link", { name: "Browse the treats" }).click();
    await expect(page).toHaveURL(/\/treats$/);

    await page.goto("/also-missing");
    await page.getByRole("link", { name: "Back home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("back-to-top appears after a deep scroll and returns to the top", async ({
    page,
  }) => {
    await page.goto("/treats");
    const button = page.getByRole("button", { name: "Back to top" });
    await expect(button).toHaveClass(/opacity-0/);

    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(button).toHaveClass(/opacity-100/);

    await button.click();
    await expect(button).toHaveClass(/opacity-0/, { timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeLessThan(10);
  });
});
