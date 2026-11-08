import { test, expect } from "../support/fixtures";
import { seedDb, resetDb } from "../support/db";

test.describe("gallery page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("shows the bento wall with a live count and an end marker on scroll", async ({
    page,
  }) => {
    await page.goto("/gallery");
    await expect(page.getByText("15 photos")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "View photo: Gallery photo 1", exact: true }),
    ).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText(/That’s the whole album — for now/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "View photo: Gallery photo 15", exact: true }),
    ).toBeVisible();
  });

  test("lightbox opens, navigates with buttons and wraps around", async ({
    page,
  }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: "View photo: Gallery photo 1", exact: true }).click();

    const lightbox = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByText("Gallery photo 1")).toBeVisible();
    await expect(lightbox.getByText("1 / 12")).toBeVisible(); // loaded page

    await lightbox.getByRole("button", { name: "Next photo" }).click();
    await expect(lightbox.getByText("Gallery photo 2")).toBeVisible();
    await expect(lightbox.getByText("2 / 12")).toBeVisible();

    // Wrap backwards past the first photo.
    await lightbox.getByRole("button", { name: "Previous photo" }).click();
    await lightbox.getByRole("button", { name: "Previous photo" }).click();
    await expect(lightbox.getByText("Gallery photo 12")).toBeVisible();
    await expect(lightbox.getByText("12 / 12")).toBeVisible();

    await lightbox.getByRole("button", { name: "Close photo viewer" }).click();
    await expect(lightbox).toBeHidden();
  });

  test("lightbox supports arrow keys and Escape", async ({ page }) => {
    await page.goto("/gallery");
    await page
      .getByRole("button", { name: "View photo: Gallery photo 2", exact: true })
      .click();

    const lightbox = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByText("2 / 12")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(lightbox.getByText("3 / 12")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(lightbox.getByText("2 / 12")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(lightbox.getByText("1 / 12")).toBeVisible(); // loaded page

    await page.keyboard.press("Escape");
    await expect(lightbox).toBeHidden();
  });

  test("clicking the backdrop closes the lightbox", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: "View photo: Gallery photo 1", exact: true }).click();
    const lightbox = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(lightbox).toBeVisible();

    // The dialog element itself is the backdrop; the inner content stops propagation.
    await lightbox.click({ position: { x: 10, y: 10 } });
    await expect(lightbox).toBeHidden();
  });

  test("failed pagination surfaces a recoverable warning banner", async ({
    page,
  }) => {
    // Fail every client-side page request (offset>0); the SSR page still loads.
    await page.route("**/api/gallery?*", async (route) => {
      const url = new URL(route.request().url());
      if (Number(url.searchParams.get("offset") ?? 0) > 0) {
        await route.abort();
      } else {
        await route.fallback();
      }
    });

    await page.goto("/gallery");
    await expect(page.getByText("15 photos")).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(
      page.locator('p[role="alert"]').filter({ hasText: "Some photos couldn’t load" }),
    ).toBeVisible();
  });

  test("an empty album renders its empty state", async ({ page }) => {
    await resetDb();
    await page.goto("/gallery");
    await expect(page.getByText("The album is empty")).toBeVisible();
  });

  test("has no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/gallery");
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
