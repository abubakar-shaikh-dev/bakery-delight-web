import { test, expect } from "../support/fixtures";
import { seedDb, collection } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin reviews manager", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("filter tabs split all / pending / approved", async ({ page }) => {
    await page.goto("/admin/reviews");

    const all = page.getByRole("button", { name: "All", exact: true });
    const pending = page.getByRole("button", { name: "Pending" });
    const approved = page.getByRole("button", { name: "Approved" });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("article")).toHaveCount(3);

    await pending.click();
    await expect(pending).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByText("Pending Person")).toBeVisible();

    await approved.click();
    await expect(page.getByRole("article")).toHaveCount(2);
    await expect(page.getByText("Pending Person")).toBeHidden();
  });

  test("approving from the row flips the pill and publishes it", async ({
    page,
  }) => {
    await page.goto("/admin/reviews");
    const pendingRow = page
      .getByRole("article")
      .filter({ hasText: "Pending Person" });
    await expect(pendingRow.getByText("Pending", { exact: true })).toBeVisible();

    await pendingRow.getByRole("button", { name: "Approve review" }).click();
    await expectToast(page, "Review approved — it's live.");
    await expect(pendingRow.getByText("Live", { exact: true })).toBeVisible();
    await expect(
      pendingRow.getByRole("button", { name: "Approve review" }),
    ).toBeHidden();

    const doc = await (await collection("reviews")).findOne({ name: "Pending Person" });
    expect(doc?.approved).toBe(true);
  });

  test("create validates inline, then saves", async ({ page }) => {
    await page.goto("/admin/reviews");
    await page.getByRole("button", { name: "Add review" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Add review" });

    await drawer.getByRole("button", { name: "Save review" }).click();
    await expect(
      drawer.getByText("Who wrote this? A name is needed."),
    ).toBeVisible();
    await expect(drawer.locator("#review-name")).toBeFocused();

    await drawer.locator("#review-name").fill("E2E Reviewer");
    await drawer
      .getByRole("radio", { name: "5 stars" })
      .click();
    await drawer.locator("#review-text").fill("short");
    await drawer.getByRole("button", { name: "Save review" }).click();
    await expect(
      drawer.getByText("The review should be at least 10 characters."),
    ).toBeVisible();

    await drawer
      .locator("#review-text")
      .fill("Added by the e2e suite to verify admin creation.");
    // New admin reviews default to approved — the toggle starts live.
    await expect(
      drawer.getByRole("button", { name: "Approved — live" }),
    ).toHaveAttribute("aria-pressed", "true");
    await drawer.getByRole("button", { name: "Save review" }).click();

    await expectToast(page, "Review added.");
    const doc = await (await collection("reviews")).findOne({ name: "E2E Reviewer" });
    expect(doc?.approved).toBe(true);
    expect(doc?.rating).toBe(5);
  });

  test("edit changes rating and text", async ({ page }) => {
    await page.goto("/admin/reviews");
    await page
      .getByRole("article")
      .filter({ hasText: "Rohit Menon" })
      .getByRole("button", { name: "Edit review" })
      .click();

    const drawer = page.getByRole("dialog").filter({ hasText: "Edit review" });
    await expect(drawer.locator("#review-name")).toHaveValue("Rohit Menon");
    await drawer.getByRole("radio", { name: "3 stars" }).click();
    await drawer
      .locator("#review-text")
      .fill("Edited by the e2e suite — still a nice review.");
    await drawer.getByRole("button", { name: "Save review" }).click();

    await expectToast(page, "Review updated.");
    const doc = await (await collection("reviews")).findOne({ name: "Rohit Menon" });
    expect(doc?.rating).toBe(3);
  });

  test("the approved toggle in the form can hide a live review", async ({
    page,
  }) => {
    await page.goto("/admin/reviews");
    await page
      .getByRole("article")
      .filter({ hasText: "Rohit Menon" })
      .getByRole("button", { name: "Edit review" })
      .click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit review" });

    await drawer.getByRole("button", { name: "Approved — live" }).click();
    // aria-pressed mirrors the "approved" flag, so hiding shows false.
    await expect(drawer.getByRole("button", { name: "Hidden" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await drawer.getByRole("button", { name: "Save review" }).click();
    await expectToast(page, "Review updated.");

    const doc = await (await collection("reviews")).findOne({ name: "Rohit Menon" });
    expect(doc?.approved).toBe(false);

    // It disappears from the public page immediately.
    await page.goto("/reviews");
    await expect(page.getByText("Rohit Menon")).toBeHidden();
  });

  test("a review can be linked to a treat and shows on its page", async ({
    page,
  }) => {
    await page.goto("/admin/reviews");
    await page
      .getByRole("article")
      .filter({ hasText: "Rohit Menon" })
      .getByRole("button", { name: "Edit review" })
      .click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit review" });

    await drawer.locator("#review-treat").selectOption({ label: "Kulfi Dream" });
    await drawer.getByRole("button", { name: "Save review" }).click();
    await expectToast(page, "Review updated.");

    const doc = await (await collection("reviews")).findOne({ name: "Rohit Menon" });
    expect(doc?.treatSlug).toBe("kulfi-dream");

    // The row names the linked treat.
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "Rohit Menon" })
        .getByText("Kulfi Dream"),
    ).toBeVisible();

    // And the treat's page shows the review with its own star summary.
    await page.goto("/treats/kulfi-dream");
    await expect(page.getByText("Rohit Menon")).toBeVisible();
    await expect(page.getByText("1 review for this treat")).toBeVisible();
  });

  test("delete asks first and then removes", async ({ page }) => {
    await page.goto("/admin/reviews");
    await page
      .getByRole("article")
      .filter({ hasText: "Rohit Menon" })
      .getByRole("button", { name: "Delete review" })
      .click();

    const confirm = page.getByRole("dialog").filter({ hasText: "Delete this review?" });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();

    await expectToast(page, "Review deleted.");
    await expect(page.getByRole("article")).toHaveCount(2);
    expect(
      await (await collection("reviews")).countDocuments({ name: "Rohit Menon" }),
    ).toBe(0);
  });
});
