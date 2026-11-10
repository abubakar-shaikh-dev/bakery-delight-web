import { test, expect } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin categories manager", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("lists categories with slugs and reorder affordances", async ({
    page,
  }) => {
    await page.goto("/admin/categories");
    await expect(page.getByText("3 categories")).toBeVisible();

    const first = page.getByRole("article").first();
    await expect(first).toContainText(FIX.categoryWithTreats);
    await expect(first).toContainText("/test-cakes");
    await expect(first.getByRole("button", { name: `Move ${FIX.categoryWithTreats} up` })).toBeDisabled();

    const last = page.getByRole("article").last();
    await expect(last).toContainText(FIX.emptyCategory);
    await expect(
      last.getByRole("button", { name: `Move ${FIX.emptyCategory} down` }),
    ).toBeDisabled();
  });

  test("create validates, then saves with a chosen icon", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.getByRole("button", { name: "Add category" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New category" });

    await drawer.getByRole("button", { name: "Add category" }).click();
    await expect(drawer.getByRole("alert")).toHaveText("Give the category a name.");

    await drawer.locator("#cat-name").fill("E2E Sweets");
    await drawer.getByRole("button", { name: "Cupcake" }).click();
    await drawer.getByRole("button", { name: "Add category" }).click();

    await expectToast(page, "“E2E Sweets” added.");
    await expect(
      page.getByRole("article").filter({ hasText: "E2E Sweets" }),
    ).toBeVisible();

    const doc = await (await collection("categories")).findOne({ name: "E2E Sweets" });
    expect(doc?.icon).toBe("cupcake");
    expect(doc?.slug).toBe("e2e-sweets");
    expect(doc?.order).toBe(3);
  });

  test("editing renames and re-slugs", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.getByRole("button", { name: `Edit ${FIX.emptyCategory}` }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit category" });
    await expect(drawer.locator("#cat-name")).toHaveValue(FIX.emptyCategory);

    await drawer.locator("#cat-name").fill("Empty Shelf Renamed");
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expectToast(page, "Category updated.");

    const doc = await (await collection("categories")).findOne({
      name: "Empty Shelf Renamed",
    });
    expect(doc?.slug).toBe("empty-shelf-renamed");
  });

  test("duplicate names are rejected with the API error", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.getByRole("button", { name: "Add category" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New category" });
    await drawer.locator("#cat-name").fill(FIX.categoryWithTreats);
    await drawer.getByRole("button", { name: "Add category" }).click();

    await expectToast(page, `"${FIX.categoryWithTreats}" already exists.`);
  });

  test("reorder swaps positions with the neighbour", async ({ page }) => {
    await page.goto("/admin/categories");
    const cookies = page
      .getByRole("article")
      .filter({ hasText: FIX.freeCategory });
    await cookies.getByRole("button", { name: `Move ${FIX.freeCategory} up` }).click();

    // Test Cookies moves above Test Cakes.
    await expect(
      page.getByRole("article").first().filter({ hasText: FIX.freeCategory }),
    ).toBeVisible({ timeout: 10_000 });
    const docs = await (await collection("categories")).find()
      .sort({ order: 1 })
      .toArray();
    expect(docs[0].name).toBe(FIX.freeCategory);
    expect(docs[1].name).toBe(FIX.categoryWithTreats);
  });

  test("deleting a category with treats is blocked server-side", async ({
    page,
  }) => {
    await page.goto("/admin/categories");
    await page.getByRole("button", { name: `Delete ${FIX.categoryWithTreats}` }).click();

    const confirm = page
      .getByRole("dialog")
      .filter({ hasText: `Delete “${FIX.categoryWithTreats}”?` });
    await expect(
      confirm.getByText("Categories with treats can't be deleted"),
    ).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();

    await expectToast(
      page,
      `"${FIX.categoryWithTreats}" still has 5 treats. Move or delete them first.`,
    );
    await expect(
      page.getByRole("article").filter({ hasText: FIX.categoryWithTreats }),
    ).toBeVisible();
  });

  test("an empty category deletes cleanly", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.getByRole("button", { name: `Delete ${FIX.emptyCategory}` }).click();
    await page
      .getByRole("dialog")
      .filter({ hasText: `Delete “${FIX.emptyCategory}”?` })
      .getByRole("button", { name: "Delete" })
      .click();

    await expectToast(page, `“${FIX.emptyCategory}” deleted.`);
    await expect(page.getByText("2 categories")).toBeVisible();
    expect(
      await (await collection("categories")).countDocuments({ name: FIX.emptyCategory }),
    ).toBe(0);
  });
});
