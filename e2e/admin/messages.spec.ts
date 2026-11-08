import { test, expect } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin messages manager", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("lists both messages with the unread one highlighted", async ({
    page,
  }) => {
    await page.goto("/admin/messages");
    await expect(page.getByText("2 messages")).toBeVisible();
    await expect(page.getByText("1 new")).toBeVisible();

    const unreadRow = page
      .getByRole("article")
      .filter({ hasText: FIX.unreadSender });
    await expect(unreadRow.getByText("New", { exact: true })).toBeVisible();
  });

  test("the unread filter shows only unread mail", async ({ page }) => {
    await page.goto("/admin/messages");
    await page.getByRole("button", { name: "unread" }).click();

    await expect(page.getByText("1 message · unread only")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(
      page.getByRole("article").filter({ hasText: FIX.unreadSender }),
    ).toBeVisible();
  });

  test("opening a message marks it read", async ({ page }) => {
    await page.goto("/admin/messages");
    const row = page
      .getByRole("article")
      .filter({ hasText: FIX.unreadSender });

    await row.getByRole("button", { name: /three tier chocolate cake/ }).click();
    const header = row.getByRole("button", { expanded: true });
    await expect(header).toBeVisible();
    await expect(row.getByText("New", { exact: true })).toBeHidden();

    // Persisted.
    const doc = await (await collection("messages")).findOne({ name: FIX.unreadSender });
    expect(doc?.read).toBe(true);
  });

  test("reply links point at the sender", async ({ page }) => {
    await page.goto("/admin/messages");
    const row = page
      .getByRole("article")
      .filter({ hasText: FIX.unreadSender });
    await row.getByRole("button", { expanded: false }).click();

    await expect(
      row.getByRole("link", { name: "Reply on WhatsApp" }),
    ).toHaveAttribute("href", "https://wa.me/919876543210");
    await expect(
      row.getByRole("link", { name: "Reply by email" }),
    ).toHaveAttribute("href", `mailto:unread@test.dev?subject=Re: your Bakery Delight message`);
  });

  test("mark unread restores the New pill", async ({ page }) => {
    await page.goto("/admin/messages");
    const row = page
      .getByRole("article")
      .filter({ hasText: FIX.readSender });
    await row.getByRole("button", { expanded: false }).click();

    await row.getByRole("button", { name: "Mark unread" }).click();
    await expect(row.getByText("New", { exact: true })).toBeVisible();

    const doc = await (await collection("messages")).findOne({ name: FIX.readSender });
    expect(doc?.read).toBe(false);
  });

  test("delete removes the message after confirmation", async ({ page }) => {
    await page.goto("/admin/messages");
    const row = page
      .getByRole("article")
      .filter({ hasText: FIX.readSender });
    await row.getByRole("button", { expanded: false }).click();
    await row.getByRole("button", { name: "Delete" }).click();

    const confirm = page.getByRole("dialog").filter({ hasText: "Delete this message?" });
    await expect(
      confirm.getByText(/will be removed permanently/),
    ).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();

    await expectToast(page, "Message deleted.");
    await expect(page.getByText("1 message")).toBeVisible();
    expect(
      await (await collection("messages")).countDocuments({ name: FIX.readSender }),
    ).toBe(0);
  });

  test("a fully read inbox shows the empty state", async ({ page }) => {
    await (await collection("messages")).updateMany({}, { $set: { read: true } });
    await page.goto("/admin/messages");
    await page.getByRole("button", { name: "unread" }).click();
    await expect(page.getByText("Inbox empty")).toBeVisible();
    await expect(page.getByText("Every message has been read.")).toBeVisible();
  });

  test("the sidebar badge tracks unread count after a navigation", async ({
    page,
  }) => {
    await page.goto("/admin/messages");
    const badge = page
      .getByRole("link", { name: /Messages/ })
      .getByText("1", { exact: true });
    await expect(badge).toBeVisible();

    // Read everything, then leave and come back — the badge refetches on nav.
    const row = page
      .getByRole("article")
      .filter({ hasText: FIX.unreadSender });
    await row.getByRole("button", { expanded: false }).click();
    await expect(row.getByText("New", { exact: true })).toBeHidden();

    await page.goto("/admin/treats");
    await page.goto("/admin/messages");
    await expect(
      page.getByRole("link", { name: /Messages/ }).getByText("1", { exact: true }),
    ).toBeHidden();
  });
});
