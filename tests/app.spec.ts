import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:3003");

  await expect(page).toHaveTitle(/Maryland/);
});
