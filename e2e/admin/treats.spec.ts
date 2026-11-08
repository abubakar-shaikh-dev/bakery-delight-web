import { test, expect } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin treats manager", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("lists treats with category chips and featured badge", async ({
    page,
  }) => {
    await page.goto("/admin/treats");
    const truffle = page
      .getByRole("article")
      .filter({ hasText: FIX.featuredTreat });
    await expect(truffle).toBeVisible();
    await expect(truffle.getByText("Test Cakes")).toBeVisible();
    await expect(truffle.getByText("Featured")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(10);
  });

  test("rows flag the selling fields they are missing", async ({ page }) => {
    await page.goto("/admin/treats");

    // Plain Batch has neither an image nor a price — both nudges show.
    const plain = page.getByRole("article").filter({ hasText: FIX.noPriceTreat });
    await expect(plain.getByText("No photo")).toBeVisible();
    await expect(plain.getByText("No price")).toBeVisible();

    // Truffle Tower has both fields — no nudges.
    const truffle = page
      .getByRole("article")
      .filter({ hasText: FIX.featuredTreat });
    await expect(truffle.getByText("No photo")).toHaveCount(0);
    await expect(truffle.getByText("No price")).toHaveCount(0);
  });

  test("debounced search narrows the list", async ({ page }) => {
    await page.goto("/admin/treats");
    await page.getByPlaceholder("Search treats…").fill(FIX.searchWord);
    await expect(page.getByRole("article")).toHaveCount(1, { timeout: 5_000 });
    await expect(
      page.getByRole("article").filter({ hasText: FIX.searchableTreat }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByRole("article")).toHaveCount(10);
  });

  test("create validates inline before saving", async ({ page }) => {
    await page.goto("/admin/treats");
    await page.getByRole("button", { name: "Add treat" }).click();

    const drawer = page.getByRole("dialog").filter({ hasText: "New treat" });
    await expect(drawer.getByRole("heading", { name: "New treat" })).toBeVisible();

    // Empty name blocks the save.
    await drawer.getByRole("button", { name: "Add to menu" }).click();
    await expect(drawer.locator('p[role="alert"]')).toHaveText(
      "Give the treat a name.",
    );
    await expect(drawer.locator("#treat-name")).toBeFocused();

    // A negative price trips the input's native min=0 constraint, so the
    // browser blocks submission before the JS validation runs.
    await drawer.locator("#treat-name").fill("E2E Truffle");
    await drawer.locator("#treat-price").fill("-5");
    await drawer.getByRole("button", { name: "Add to menu" }).click();
    const underflow = await drawer
      .locator("#treat-price")
      .evaluate((el) => (el as HTMLInputElement).validity.rangeUnderflow);
    expect(underflow).toBe(true);
  });

  test("create saves the treat and it appears on the public site", async ({
    page,
  }) => {
    await page.goto("/admin/treats");
    await page.getByRole("button", { name: "Add treat" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New treat" });

    await drawer.locator("#treat-name").fill("E2E Truffle");
    await drawer.locator("#treat-category").selectOption(FIX.categoryWithTreats);
    await drawer.locator("#treat-price").fill("321");
    await drawer
      .locator("#treat-description")
      .fill("Created by the e2e suite to verify the whole path.");
    await drawer.locator("#treat-weight").fill("900 g");
    await drawer.locator("#treat-serves").fill("6–8 people");
    await drawer.getByRole("button", { name: "Add to menu" }).click();

    await expectToast(page, "Treat added to the menu.");
    await expect(
      page.getByRole("article").filter({ hasText: "E2E Truffle" }),
    ).toBeVisible();

    const docs = await (await collection("treats")).find({ name: "E2E Truffle" }).toArray();
    expect(docs).toHaveLength(1);
    expect(docs[0].slug).toBe("e2e-truffle");
    expect(docs[0].price).toBe(321);
    expect(docs[0].category).toBe(FIX.categoryWithTreats);
    expect(docs[0].weight).toBe("900 g");
    expect(docs[0].serves).toBe("6–8 people");

    // Public treats page shows it too (force-dynamic, no cache).
    await page.goto("/treats");
    await expect(
      page.getByRole("article").filter({ hasText: "E2E Truffle" }),
    ).toBeVisible();

    // And the detail page renders the new fields.
    await page.goto("/treats/e2e-truffle");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E Truffle");
    await expect(page.getByText("900 g")).toBeVisible();
    await expect(page.getByText("6–8 people")).toBeVisible();
  });

  test("the featured toggle drives the homepage strip", async ({ page }) => {
    await page.goto("/admin/treats");
    await page.getByRole("button", { name: "Add treat" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New treat" });

    const toggle = drawer.getByRole("button", { name: "Not featured" });
    await toggle.click();
    await expect(
      drawer.getByRole("button", { name: "On homepage" }),
    ).toHaveAttribute("aria-pressed", "true");

    await drawer.locator("#treat-name").fill("E2E Headliner");
    await drawer.getByRole("button", { name: "Add to menu" }).click();
    await expectToast(page, "Treat added to the menu.");

    // Homepage features it next to the seeded featured treat.
    await page.goto("/");
    await expect(page.getByText("E2E Headliner")).toBeVisible();
  });

  test("edit updates the treat", async ({ page }) => {
    await page.goto("/admin/treats");
    await page.getByRole("button", { name: `Edit ${FIX.searchableTreat}` }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit treat" });
    await expect(drawer.locator("#treat-name")).toHaveValue(FIX.searchableTreat);

    await drawer.locator("#treat-price").fill("299");
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expectToast(page, "Treat updated.");

    const doc = await (await collection("treats")).findOne({ name: FIX.searchableTreat });
    expect(doc?.price).toBe(299);
  });

  test("delete asks first, can be cancelled, then removes", async ({ page }) => {
    await page.goto("/admin/treats");

    // Cancel keeps the row.
    await page.getByRole("button", { name: `Delete ${FIX.searchableTreat}` }).click();
    const confirm = page.getByRole("dialog").filter({ hasText: "Remove" });
    await expect(
      confirm.getByRole("heading", { name: `Remove “${FIX.searchableTreat}”?` }),
    ).toBeVisible();
    await expect(
      confirm.getByText("It will disappear from the public menu immediately."),
    ).toBeVisible();
    // The safe action ("Keep it") holds focus so Enter can't confirm a loss.
    await expect(confirm.getByRole("button", { name: "Keep it" })).toBeFocused();
    await confirm.getByRole("button", { name: "Keep it" }).click();
    await expect(confirm).toBeHidden();
    expect(
      await (await collection("treats")).countDocuments({ name: FIX.searchableTreat }),
    ).toBe(1);

    // Confirm removes it everywhere.
    await page.getByRole("button", { name: `Delete ${FIX.searchableTreat}` }).click();
    await page
      .getByRole("dialog")
      .filter({ hasText: `Remove “${FIX.searchableTreat}”?` })
      .getByRole("button", { name: "Remove" })
      .click();
    await expectToast(page, `"${FIX.searchableTreat}" removed from the menu.`);
    await expect(page.getByRole("article")).toHaveCount(9);
    expect(
      await (await collection("treats")).countDocuments({ name: FIX.searchableTreat }),
    ).toBe(0);
  });

  test("closing a dirty drawer offers a discard guard", async ({ page }) => {
    await page.goto("/admin/treats");
    await page.getByRole("button", { name: `Edit ${FIX.searchableTreat}` }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit treat" });
    await drawer.locator("#treat-name").fill("Renamed mid-edit");

    // X routes through the guard.
    await drawer.getByRole("button", { name: "Close", exact: true }).click();
    const guard = page.getByRole("dialog").filter({ hasText: "Discard changes?" });
    await expect(guard.getByRole("heading", { name: "Discard changes?" })).toBeVisible();

    await guard.getByRole("button", { name: "Keep it" }).click();
    await expect(drawer.locator("#treat-name")).toHaveValue("Renamed mid-edit");

    await drawer.getByRole("button", { name: "Close", exact: true }).click();
    await page
      .getByRole("dialog")
      .filter({ hasText: "Discard changes?" })
      .getByRole("button", { name: "Discard" })
      .click();
    await expect(drawer).toBeHidden();

    // Nothing was saved.
    const doc = await (await collection("treats")).findOne({ name: "Renamed mid-edit" });
    expect(doc).toBeNull();
  });

  test("an empty menu shows its empty state", async ({ page }) => {
    const { resetDb } = await import("../support/db");
    await resetDb();
    await page.goto("/admin/treats");
    await expect(page.getByText("The menu is empty")).toBeVisible();
  });

  test("a failed load shows the error card and recovers on retry", async ({
    page,
  }) => {
    await page.route("**/api/admin/treats?*", (route) => route.abort());
    await page.goto("/admin/treats");
    await expectToast(page, "Couldn't load treats.");
    await expect(
      page.getByText("The treats list couldn't be loaded."),
    ).toBeVisible();

    await page.unroute("**/api/admin/treats?*");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("article").first()).toBeVisible();
  });
});
