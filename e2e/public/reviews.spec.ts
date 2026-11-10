import { test, expect } from "../support/fixtures";
import { formAlert } from "../support/helpers";
import { seedDb, collection } from "../support/db";

test.describe("reviews page", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("summarises the average and lists approved reviews only", async ({
    page,
  }) => {
    await page.goto("/reviews");
    await expect(page.getByText("4.5")).toBeVisible();
    await expect(page.getByText("2 reviews")).toBeVisible();

    await expect(page.getByText("Asha Verma")).toBeVisible();
    await expect(page.getByText("Rohit Menon")).toBeVisible();
    await expect(page.getByText("Pending Person")).toBeHidden();
  });

  test("the form validates each field in order", async ({ page }) => {
    await page.goto("/reviews");
    const submit = page.getByRole("button", { name: "Send review" });

    await submit.click();
    await expect(formAlert(page)).toHaveText("Please add your name.");

    await page.getByLabel("Your name").fill("Test Submitter");
    await submit.click();
    await expect(formAlert(page)).toHaveText("Please pick a star rating.");

    await page.getByRole("button", { name: "5 stars" }).click();
    await page.getByLabel("Your review").fill("too short");
    await submit.click();
    await expect(formAlert(page)).toHaveText(
      "Your review should be at least 10 characters.",
    );

    await page
      .getByLabel("Your review")
      .fill("A lovely review of proper length.");
    // type=url blocks submission natively before the JS check can run.
    await page.getByLabel("Link to your post").fill("not-a-url");
    await submit.click();
    const mismatch = await page
      .getByLabel("Link to your post")
      .evaluate((el) => (el as HTMLInputElement).validity.typeMismatch);
    expect(mismatch).toBe(true);
  });

  test("the character counter tracks input", async ({ page }) => {
    await page.goto("/reviews");
    const text = page.getByLabel("Your review");
    await text.fill("12345");
    await expect(page.getByText("5/600")).toBeVisible();
  });

  test("a submitted review lands unapproved and stays off the list", async ({
    page,
  }) => {
    await page.goto("/reviews");
    await page.getByLabel("Your name").fill("Test Submitter");
    await page.getByRole("button", { name: "4 stars" }).click();
    await page
      .getByLabel("Your review")
      .fill("Submitted through the e2e suite, thank you.");
    await page.getByRole("button", { name: "Send review" }).click();

    await expect(page.getByText("Thank you, Test")).toBeVisible();
    await expect(
      page.getByText("It will appear here once it’s been through a quick check."),
    ).toBeVisible();

    // Stored as unapproved.
    const docs = await (await collection("reviews")).find({ name: "Test Submitter" })
      .toArray();
    expect(docs).toHaveLength(1);
    expect(docs[0].approved).toBe(false);
    expect(docs[0].rating).toBe(4);

    // And not publicly visible after a reload.
    await page.reload();
    await expect(page.getByText("Test Submitter")).toBeHidden();
  });
});
