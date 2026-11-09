import { test, expect } from "../support/fixtures";
import { formAlert } from "../support/helpers";
import { seedDb, collection, FIX } from "../support/db";

test.describe("contact page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("shows the WhatsApp, phone, email, address and social cards", async ({
    page,
  }) => {
    await page.goto("/contact");

    const wa = page.getByRole("link", { name: /Chat on WhatsApp/ });
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/919876543210\?text=/,
    );
    await expect(wa).toContainText(FIX.whatsappNumber);

    await expect(page.getByRole("link", { name: /Call us/ })).toHaveAttribute(
      "href",
      "tel:+919876543210",
    );
    await expect(page.getByRole("link", { name: /^Email/ })).toHaveAttribute(
      "href",
      `mailto:${FIX.email}`,
    );
    // The address is quoted twice by design: the "Find us" card and the
    // FAQ answer (which mirrors the FAQPage schema).
    await expect(
      page.getByRole("main").getByText("12 Flour Lane, Mumbai"),
    ).toHaveCount(2);

    // Only configured socials render — the seed sets Instagram only.
    await expect(
      page.getByRole("main").getByRole("link", { name: "Instagram" }),
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Pinterest" })).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("link", { name: "YouTube" })).toHaveCount(0);
  });

  test("the form validates each field in order", async ({ page }) => {
    await page.goto("/contact");
    const submit = page.getByRole("button", { name: "Send message" });

    await submit.click();
    await expect(formAlert(page)).toHaveText("Please tell us your name.");

    await page.getByLabel("Your name").fill("E2E Sender");
    await submit.click();
    await expect(formAlert(page)).toHaveText(
      "Please enter a valid email address.",
    );

    await page.getByLabel("Email").fill("sender@test.dev");
    await page.getByLabel("Phone / WhatsApp").fill("abc");
    await submit.click();
    await expect(formAlert(page)).toHaveText(
      "That phone number doesn't look right — digits, spaces and + only.",
    );

    await page.getByLabel("Phone / WhatsApp").fill("+91 90000 00000");
    await submit.click();
    await expect(formAlert(page)).toHaveText(
      "Please write a short message.",
    );
  });

  test("a valid submission shows the success panel and stores the message", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByLabel("Your name").fill("E2E Sender");
    await page.getByLabel("Email").fill("sender@test.dev");
    await page
      .getByLabel("Your message")
      .fill("Please make a unicorn cake for Saturday.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message received")).toBeVisible();
    const wa = page.getByRole("link", { name: "Message us on WhatsApp" });
    await expect(wa).toHaveAttribute("href", /https:\/\/wa\.me\/919876543210/);

    const docs = await (await collection("messages")).find({ name: "E2E Sender" })
      .toArray();
    expect(docs).toHaveLength(1);
    expect(docs[0].email).toBe("sender@test.dev");
    expect(docs[0].read).toBe(false);
  });

  test("a server failure surfaces the API's error copy inline", async ({
    page,
  }) => {
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error:
            "We couldn't reach the kitchen right now. Please try WhatsApp instead.",
        }),
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Your name").fill("E2E Sender");
    await page.getByLabel("Email").fill("sender@test.dev");
    await page.getByLabel("Your message").fill("Hello there, testing errors.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(formAlert(page)).toHaveText(
      "We couldn't reach the kitchen right now. Please try WhatsApp instead.",
    );
  });

  test("has no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/contact");
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
