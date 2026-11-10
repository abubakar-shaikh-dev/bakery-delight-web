import { test, expect } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

/**
 * The marquee end-to-end path: a visitor's public actions surface in the
 * admin panel, and admin decisions change what the public sees.
 */
test.describe("public → admin → public", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("a contact message becomes an unread admin message and gets handled", async ({
    page,
  }) => {
    // 1. Visitor sends the form.
    await page.goto("/contact");
    await page.getByLabel("Your name").fill("Journey Sender");
    await page.getByLabel("Email").fill("journey@test.dev");
    await page
      .getByLabel("Your message")
      .fill("Planning an anniversary cake for next month.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message received")).toBeVisible();

    // 2. Admin sees it in the badge, opens it, and it's marked read.
    await page.goto("/admin/messages");
    const badge = page
      .getByRole("link", { name: /Messages/ })
      .getByText("2", { exact: true }); // 1 seeded + 1 new
    await expect(badge).toBeVisible();

    const row = page
      .getByRole("article")
      .filter({ hasText: "Journey Sender" });
    await expect(row.getByText("New", { exact: true })).toBeVisible();
    await row.getByRole("button", { name: /anniversary cake/ }).click();
    await expect(row.getByText("New", { exact: true })).toBeHidden();

    // 3. The badge drops after navigating (it refetches per pathname).
    await page.goto("/admin");
    await expect(
      page.getByRole("link", { name: /Messages/ }).getByText("1", { exact: true }),
    ).toBeVisible();
  });

  test("a public review lands pending, gets approved and goes live", async ({
    page,
  }) => {
    // 1. Visitor submits a review.
    await page.goto("/reviews");
    await page.getByLabel("Your name").fill("Journey Reviewer");
    await page.getByRole("button", { name: "5 stars" }).click();
    await page
      .getByLabel("Your review")
      .fill("The whole journey worked perfectly — five stars!");
    await page.getByRole("button", { name: "Send review" }).click();
    await expect(page.getByText("Thank you, Journey")).toBeVisible();

    // 2. It is not public yet.
    await page.goto("/reviews");
    await expect(page.getByText("Journey Reviewer")).toBeHidden();

    // 3. Admin approves it from the pending tab.
    await page.goto("/admin/reviews");
    await page.getByRole("button", { name: "Pending" }).click();
    const row = page.getByRole("article").filter({ hasText: "Journey Reviewer" });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Approve review" }).click();
    await expectToast(page, "Review approved — it's live.");

    // 4. Now the public page shows it.
    await page.goto("/reviews");
    await expect(page.getByText("Journey Reviewer")).toBeVisible();
  });

  test("a review submitted through the API can be approved from the dashboard", async ({
    page,
  }) => {
    // Seed a pending review directly (unique IP — doesn't touch the browser's
    // rate-limit bucket).
    const res = await page.request.post("/api/reviews", {
      data: {
        name: "Dashboard Journey",
        rating: 4,
        text: "Posted via the API, approved from the dashboard panel.",
      },
      headers: { "x-forwarded-for": "10.200.0.7" },
    });
    expect(res.status()).toBe(200);

    await page.goto("/admin");
    const approve = page.getByRole("button", {
      name: "Approve review by Dashboard Journey",
    });
    await expect(approve).toBeVisible();
    await approve.click();
    await expectToast(page, "Review approved — it's live on the site.");

    const doc = await (await collection("reviews")).findOne({ name: "Dashboard Journey" });
    expect(doc?.approved).toBe(true);
  });

  test("featured treats and settings changes appear for visitors", async ({
    page,
  }) => {
    // Admin toggles a new treat to featured.
    await page.goto("/admin/treats");
    await page
      .getByRole("button", { name: `Edit ${FIX.searchableTreat}` })
      .click();
    const drawer = page.getByRole("dialog").filter({ hasText: "Edit treat" });
    await drawer.getByRole("button", { name: "Not featured" }).click();
    await drawer.getByRole("button", { name: "Save changes" }).click();
    await expectToast(page, "Treat updated.");

    // The homepage strip now includes it.
    await page.goto("/");
    await expect(page.getByText(FIX.searchableTreat)).toBeVisible();
  });
});
