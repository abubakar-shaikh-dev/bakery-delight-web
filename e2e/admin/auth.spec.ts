import { test, expect } from "../support/fixtures";
import { adminEmail, adminPassword } from "../support/env";

// This spec exercises the unauthenticated side of the fence.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("admin auth", () => {
  test("protected routes redirect to login and preserve the destination", async ({
    page,
  }) => {
    await page.goto("/admin/treats");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Ftreats$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin$/);
  });

  test("the login form rejects wrong credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail());
    await page.getByLabel("Password", { exact: true }).fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText("Incorrect email or password."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("signing in lands on the dashboard and the session sticks", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail());
    await page.getByLabel("Password", { exact: true }).fill(adminPassword());
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    // Shell renders the signed-in email.
    await expect(page.getByText(adminEmail())).toBeVisible();

    // Reload keeps the session (cookie survives).
    await page.reload();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("a successful login honours the ?next= destination", async ({ page }) => {
    await page.goto("/admin/settings"); // bounced to login?next=/admin/settings
    await page.getByLabel("Email").fill(adminEmail());
    await page.getByLabel("Password", { exact: true }).fill(adminPassword());
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(
      page.getByRole("heading", { name: "Settings" }),
    ).toBeVisible();
  });

  test("an authenticated visit to /admin/login bounces back to the panel", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(adminEmail());
    await page.getByLabel("Password", { exact: true }).fill(adminPassword());
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("the password visibility toggle reveals the typed password", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    const pw = page.getByLabel("Password", { exact: true });
    await pw.fill("secret123");
    await expect(pw).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Show password" }).click();
    await expect(pw).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(pw).toHaveAttribute("type", "password");
  });

  test("admin APIs answer 401 without a session", async ({ request }) => {
    const res = await request.get("/api/admin/treats");
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });

    const post = await request.post("/api/admin/treats", { data: {} });
    expect(post.status()).toBe(401);
  });
});

test.describe("admin auth (signed in)", () => {
  test.use({ storageState: "playwright/.auth/admin.json" });

  test("sign out clears the session and returns to login", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/admin\/login$/);
    // The cookie is really gone: reloading /admin bounces back.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
