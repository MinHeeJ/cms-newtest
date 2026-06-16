import { expect, test } from "@playwright/test";

test("dashboard and create flow expose accessible landmarks and controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create CMS Site/ }).first()).toBeVisible();

  await page.getByRole("link", { name: /Create CMS Site/ }).first().click();
  await expect(page.getByRole("heading", { name: "Create CMS Site" })).toBeVisible();
  await expect(page.getByLabel("Site name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
});
