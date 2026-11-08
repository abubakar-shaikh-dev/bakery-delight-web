import { test, expect } from "../support/fixtures";
import { seedDb } from "../support/db";

test.describe("about page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("renders the static story, values and stats", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "A Home Kitchen, With Big Dreams" }),
    ).toBeVisible();
    await expect(page.getByText("It began with one cake")).toBeVisible();

    await expect(page.getByText("500+")).toBeVisible();
    await expect(page.getByText("Happy Customers")).toBeVisible();
    // Stats render value and label as separate paragraphs.
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("Homemade", { exact: true })).toBeVisible();
    await expect(page.getByText("50+")).toBeVisible();
    await expect(page.getByText("Unique Creations")).toBeVisible();
  });

  test("ends in the CTA band linking to contact", async ({ page }) => {
    await page.goto("/about");
    const band = page.locator("#order");
    await band.scrollIntoViewIfNeeded();
    await expect(
      band.getByRole("link", { name: "Contact Me" }),
    ).toHaveAttribute("href", "/contact");
    await expect(
      band.getByRole("link", { name: "Order Now" }),
    ).toHaveAttribute("href", "/contact");
  });
});
