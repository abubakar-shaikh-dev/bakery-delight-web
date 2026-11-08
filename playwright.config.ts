import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E tests run against a throwaway database so they never touch the
 * owner's real content:
 *  - MONGODB_DB is overridden to "bakerydelight_test" (same Mongo server).
 *  - Cloudinary vars are blanked so uploads fall back to MongoDB storage
 *    inside the test database (src/lib/storage.ts handles the fallback).
 * ADMIN_EMAIL / ADMIN_PASSWORD / AUTH_SECRET / MONGODB_URI come from
 * .env.local, which the dev server loads (already-set env vars win).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
        // This machine's renderer processes crash (0xC0000002) with the GPU
        // path enabled — keep Chromium on software rendering.
        launchOptions: {
          args: ["--disable-gpu", "--disable-gpu-sandbox"],
        },
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm exec next dev -p 3100",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      MONGODB_DB: "bakerydelight_test",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
    },
  },
});
