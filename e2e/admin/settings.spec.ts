import { test, expect } from "../support/fixtures";
import { formAlert } from "../support/helpers";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";

test.describe("admin settings", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("loads the current settings and blocks saving until dirty", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await expect(page.getByText("Bakery identity")).toBeVisible();
    await expect(page.locator("#set-bakery-name")).toHaveValue("Bakery Delight");
    await expect(page.locator("#set-wa-digits")).toHaveValue(FIX.whatsappDigits);
    await expect(page.locator("#set-email")).toHaveValue(FIX.email);

    await expect(page.getByText("No changes yet")).toBeVisible();
    const save = page.getByRole("button", { name: "Save settings" });
    await expect(save).toBeDisabled();
  });

  test("invalid WhatsApp digits flag the field on blur", async ({ page }) => {
    await page.goto("/admin/settings");
    const digits = page.locator("#set-wa-digits");

    await digits.fill("123abc");
    await digits.blur();    await expect(formAlert(page)).toHaveText(
      "Use country code + number, digits only (e.g. 919876543210).",
    );
    await expect(digits).toHaveAttribute("aria-invalid", "true");

    // The error clears as soon as the value changes.
    await digits.fill("919876540000");
    await expect(formAlert(page)).toHaveCount(0);
  });

  test("saving updates the site and the change reaches the public page", async ({
    page,
  }) => {
    await page.goto("/admin/settings");

    await page.locator("#set-bakery-name").fill("Bakery Delight E2E");
    await page.locator("#set-email").fill("kitchen@e2e.test");
    await page.locator("#set-wa-digits").fill("919000000000");

    const save = page.getByRole("button", { name: "Save settings" });
    await expect(save).toBeEnabled();
    await expect(page.getByText("No changes yet")).toBeHidden();
    await save.click();

    await expectToast(page, "Settings saved — the site is updated.");

    const doc = await (await collection("settings")).findOne({ key: "site" });
    expect(doc?.bakeryName).toBe("Bakery Delight E2E");
    expect(doc?.whatsappDigits).toBe("919000000000");

    // The public contact page renders the new details (force-dynamic).
    await page.goto("/contact");
    await expect(
      page.getByRole("link", { name: /Chat on WhatsApp/ }),
    ).toHaveAttribute("href", /^https:\/\/wa\.me\/919000000000/);
    await expect(
      page.getByRole("main").getByText("kitchen@e2e.test"),
    ).toBeVisible();
  });

  test("social URL fields round-trip to the DB", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.locator("#set-social-pinterest").fill("https://pinterest.com/e2e");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expectToast(page, "Settings saved — the site is updated.");

    const doc = await (await collection("settings")).findOne({ key: "site" });
    expect(doc?.socials?.pinterest).toBe("https://pinterest.com/e2e");

    // The contact page (and footer) now show the Pinterest icon too.
    await page.goto("/contact");
    await expect(
      page.getByRole("main").getByRole("link", { name: "Pinterest" }),
    ).toBeVisible();
  });

  test("WhatsApp digit guardrails warn before order links break", async ({
    page,
  }) => {
    await page.goto("/admin/settings");

    const digitsWarning = page.getByText(
      "Every Order on WhatsApp button on the site disappears",
    );
    const displayHint = page.getByText("add the display number");

    // Seeded settings have both fields — no warnings anywhere.
    await expect(digitsWarning).toBeHidden();
    await expect(displayHint).toBeHidden();

    // Empty digits is the revenue-killing state — warn loudly.
    const digits = page.locator("#set-wa-digits");
    await digits.fill("");
    await expect(digitsWarning).toBeVisible();

    await digits.fill("919876540000");
    await expect(digitsWarning).toBeHidden();

    // Digits without a display number hide it from the contact page.
    await page.locator("#set-wa-number").fill("");
    await expect(displayHint).toBeVisible();
  });
});
