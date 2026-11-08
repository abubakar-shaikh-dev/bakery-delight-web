import { test, expect } from "../support/fixtures";
import { seedDb, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin dashboard", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("stat cards reflect the seeded data", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Today at the bakery")).toBeVisible();

    // 1 pending review + 1 unread message in the seed.
    await expect(
      page.getByText("1 review waiting for approval and 1 unread message"),
    ).toBeVisible();

    await expect(page.getByText("Treats on the menu")).toBeVisible();
    await expect(
      page.locator("a", { hasText: "Treats on the menu" }).getByText("10", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("a", { hasText: "Approved reviews" }).getByText("2", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("a", { hasText: "Unread messages" }).getByText("1", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("a", { hasText: "Gallery photos" }).getByText("15", { exact: true }),
    ).toBeVisible();
  });

  test("quick actions and sidebar navigate to their managers", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: "Add a treat" }).click();
    await expect(page).toHaveURL(/\/admin\/treats$/);

    await page.goto("/admin");
    await page.getByRole("link", { name: "Upload photos" }).click();
    await expect(page).toHaveURL(/\/admin\/gallery$/);

    await page.goto("/admin");
    await page.getByRole("link", { name: "Check messages" }).click();
    await expect(page).toHaveURL(/\/admin\/messages$/);
  });

  test("latest messages panel lists inbox entries with an unread dot", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Latest messages" }),
    ).toBeVisible();
    await expect(page.getByText(FIX.unreadSender)).toBeVisible();
    await expect(page.getByText(FIX.readSender)).toBeVisible();
  });

  test("a pending review can be approved straight from the dashboard", async ({
    page,
  }) => {
    await page.goto("/admin");
    const approve = page.getByRole("button", {
      name: "Approve review by Pending Person",
    });
    await expect(approve).toBeVisible();
    await approve.click();

    await expectToast(page, "Review approved — it's live on the site.");
    // router.refresh() re-renders the server component: pending count drops.
    await expect(
      page.getByText("1 review waiting for approval and 1 unread message"),
    ).toBeHidden({ timeout: 15_000 });
  });
});
