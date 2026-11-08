import { expect as baseExpect, type Page } from "@playwright/test";

/**
 * Toasts live in a role="status" host and auto-dismiss after 3200ms, so
 * assertions must run right after the triggering action.
 */
export async function expectToast(page: Page, text: string): Promise<void> {
  // CSS, not getByRole: while a vaul drawer is open it sets aria-hidden on
  // the app root, which hides error toasts from the accessibility tree.
  await baseExpect(
    page.locator('[role="status"]').filter({ hasText: text }).first(),
  ).toBeVisible();
}

export async function expectNoToast(page: Page, text: string): Promise<void> {
  await baseExpect(
    page.locator('[role="status"]').filter({ hasText: text }).first(),
  ).toBeHidden();
}

/**
 * Inline form errors are <p role="alert"> — scoped by tag because Next dev
 * injects its own div#__next-route-announcer__ with role="alert".
 */
export function formAlert(page: Page) {
  return page.locator('p[role="alert"]');
}

/** A drawer title is a heading inside the vaul dialog. */
export function drawerTitle(page: Page, text: string) {
  return page.getByRole("dialog").getByRole("heading", { name: text });
}

/** Click a row's icon button identified by its aria-label. */
export function rowButton(page: Page, label: string) {
  return page.getByRole("button", { name: label, exact: true });
}
