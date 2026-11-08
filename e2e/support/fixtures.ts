import { test as base } from "@playwright/test";

/**
 * Wraps page.goto so every navigation also waits for hydration: Next's
 * route announcer node only exists once the App Router client has booted,
 * and acting earlier can race the toast bus / event handlers in dev.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (...args) => {
      const res = await goto(...(args as Parameters<typeof goto>));
      await page
        .waitForSelector("#__next-route-announcer__", {
          state: "attached",
          timeout: 20_000,
        })
        .catch(() => undefined);
      return res;
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture teardown, not a React hook
    await use(page);
  },
});

export { expect } from "@playwright/test";
export type { APIResponse } from "@playwright/test";
