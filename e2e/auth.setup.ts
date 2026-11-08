import { mkdirSync } from "node:fs";
import { test as setup, expect } from "@playwright/test";
import { adminEmail, adminPassword } from "./support/env";

const authFile = "playwright/.auth/admin.json";

// One login per run — stays well under the 10-attempts/10-min limiter.
setup("authenticate as admin", async ({ request }) => {
  const res = await request.post("/api/auth/login", {
    data: { email: adminEmail(), password: adminPassword() },
  });
  expect(res.status()).toBe(200);
  mkdirSync("playwright/.auth", { recursive: true });
  await request.storageState({ path: authFile });
});
