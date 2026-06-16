import { expect, test } from "@playwright/test";

test("dashboard and create flow expose accessible landmarks and controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("navigation")).toBeVisible();
  const hero = page.getByTestId("dashboard-hero");
  await expect(hero).toBeVisible();
  await expect(hero).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(page.getByTestId("dashboard-hero-background")).toHaveCSS(
    "background-image",
    /cms-dashboard-hero\.png/
  );
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(/Plan CMS site drafts/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Create CMS Site/ }).first()).toBeVisible();

  await page.getByRole("link", { name: /Create CMS Site/ }).first().click();
  await expect(page.getByRole("heading", { name: "Create CMS Site" })).toBeVisible();
  await expect(page.getByLabel("Site name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
});
