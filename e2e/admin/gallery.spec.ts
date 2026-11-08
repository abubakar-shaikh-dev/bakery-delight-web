import { test, expect } from "../support/fixtures";
import { seedDb, collection, FIX } from "../support/db";
import { expectToast } from "../support/helpers";
import { jpegFile, oversizeFile, textFile } from "../support/files";

test.describe("admin gallery manager", () => {
  test.beforeEach(async () => {
    await seedDb();
  });

  test("lists the photos with a count", async ({ page }) => {
    await page.goto("/admin/gallery");
    await expect(page.getByText("15 photos")).toBeVisible();
    await expect(page.getByText("Gallery photo 1").first()).toBeVisible();
  });

  test("add-photo rejects submitting without a crop", async ({ page }) => {
    await page.goto("/admin/gallery");
    await page.getByRole("button", { name: "Add photo" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New photo" });
    await drawer.getByRole("button", { name: "Add to gallery" }).click();
    await expect(drawer.getByRole("alert")).toHaveText(
      "Choose and crop a photo first.",
    );
  });

  test("non-image and oversized files are refused before cropping", async ({
    page,
  }) => {
    await page.goto("/admin/gallery");
    await page.getByRole("button", { name: "Add photo" }).click();

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles(textFile);
    await expectToast(page, "That file isn't an image.");

    await fileInput.setInputFiles(oversizeFile());
    await expectToast(page, "Image is larger than 8 MB — pick a smaller one.");
  });

  test("the full crop-and-add flow stores the photo in the test DB", async ({
    page,
  }) => {
    await page.goto("/admin/gallery");
    await page.getByRole("button", { name: "Add photo" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New photo" });

    await page.locator('input[type="file"]').setInputFiles(await jpegFile());

    // The cropper sheet opens with the three shape options.
    const cropper = page.getByRole("dialog", { name: "Crop photo" });
    await expect(cropper.getByText("Crop your photo")).toBeVisible();
    const shape = cropper.getByRole("radiogroup", { name: "Crop shape" });
    await expect(shape.getByRole("radio", { name: "Square" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    // Keyboard activation — pointer clicks race the cropper's rAF loop on
    // software-rendered headless Chromium.
    const wide = shape.getByRole("radio", { name: "Wide" });
    await wide.focus();
    await page.keyboard.press("Enter");
    await expect(wide).toHaveAttribute("aria-checked", "true");

    // Zoom controls respond.
    const zoomIn = cropper.getByRole("button", { name: "Zoom in" });
    const zoomOut = cropper.getByRole("button", { name: "Zoom out" });
    await expect(zoomOut).toBeDisabled(); // zoom floor is 1
    await zoomIn.focus();
    await page.keyboard.press("Enter");
    await expect(zoomOut).toBeEnabled();

    await expect(
      cropper.getByRole("button", { name: "Crop & upload" }),
    ).toBeEnabled();
    await cropper.getByRole("button", { name: "Crop & upload" }).focus();
    await page.keyboard.press("Enter");
    // Cloudinary is disabled in the test server — storage falls back to the DB.
    await expectToast(page, "Photo saved.");

    // The drawer now previews the upload; fill the caption and save.
    await expect(drawer.getByRole("button", { name: "Replace" })).toBeVisible();
    await drawer.locator("#gallery-caption").fill("E2E wide crop");
    await drawer.getByRole("button", { name: "Add to gallery" }).click();

    await expectToast(page, "Photo added to the gallery.");
    await expect(page.getByText("16 photos")).toBeVisible();

    const doc = await (await collection("galleryimages")).findOne({
      caption: "E2E wide crop",
    });
    expect(doc).toBeTruthy();
    expect(doc?.ratio).toBe("16:9");
    expect(String(doc?.url)).toMatch(/^\/api\/images\/[a-f0-9]{24}$/);

    // Public gallery shows it too.
    await page.goto("/gallery");
    await expect(page.getByText("16 photos")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "View photo: E2E wide crop" }),
    ).toBeVisible();
  });

  test("cancelling the cropper returns to the form without uploading", async ({
    page,
  }) => {
    await page.goto("/admin/gallery");
    await page.getByRole("button", { name: "Add photo" }).click();
    await page.locator('input[type="file"]').setInputFiles(await jpegFile());

    const cropper = page.getByRole("dialog", { name: "Crop photo" });
    await expect(cropper).toBeVisible();
    await cropper.getByRole("button", { name: "Cancel" }).focus();
    await page.keyboard.press("Enter");
    await expect(cropper).toBeHidden();

    // Still no image chosen — the inline error still applies on submit.
    const drawer = page.getByRole("dialog").filter({ hasText: "New photo" });
    await drawer.getByRole("button", { name: "Add to gallery" }).focus();
    await page.keyboard.press("Enter");
    await expect(drawer.getByRole("alert")).toHaveText(
      "Choose and crop a photo first.",
    );
  });

  test("captions are edited inline and persisted", async ({ page }) => {
    await page.goto("/admin/gallery");
    const first = page.getByRole("figure").first();

    await first.getByRole("button", { name: "Edit caption" }).click();
    const input = first.getByRole("textbox", { name: "Edit caption" });
    await expect(input).toHaveValue(FIX.galleryCaption1);
    await input.fill("Renamed by e2e");
    await first.getByRole("button", { name: "Save caption" }).click();

    await expectToast(page, "Caption updated.");
    await expect(page.getByText("Renamed by e2e")).toBeVisible();
    const doc = await (await collection("galleryimages")).findOne({
      caption: "Renamed by e2e",
    });
    expect(doc).toBeTruthy();
  });

  test("deleting a photo also removes its stored bytes", async ({ page }) => {
    await page.goto("/admin/gallery");
    const uploadsBefore = await (await collection("uploadedimages")).countDocuments();
    const first = page.getByRole("figure").first();

    await first.getByRole("button", { name: "Delete photo" }).click();
    const confirm = page.getByRole("dialog").filter({ hasText: "Remove this photo?" });
    await expect(
      confirm.getByText("It will also be deleted from storage."),
    ).toBeVisible();
    await confirm.getByRole("button", { name: "Remove" }).click();

    await expectToast(page, "Photo removed.");
    await expect(page.getByText("14 photos")).toBeVisible();

    const uploadsAfter = await (await collection("uploadedimages")).countDocuments();
    expect(uploadsAfter).toBe(uploadsBefore - 1);
  });

  test("closing a started photo offers the discard sheet", async ({ page }) => {
    await page.goto("/admin/gallery");
    await page.getByRole("button", { name: "Add photo" }).click();
    const drawer = page.getByRole("dialog").filter({ hasText: "New photo" });
    await drawer.locator("#gallery-caption").fill("Unsaved caption");

    await drawer.getByRole("button", { name: "Close", exact: true }).click();
    const guard = page.getByRole("dialog").filter({ hasText: "Discard this photo?" });
    await expect(guard).toBeVisible();
    await guard.getByRole("button", { name: "Discard" }).click();
    await expect(drawer).toBeHidden();

    expect(
      await (await collection("galleryimages")).countDocuments({ caption: "Unsaved caption" }),
    ).toBe(0);
  });
});
