import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://localhost:6083");

  await expect(page).toHaveTitle(/Maryland/);
});
