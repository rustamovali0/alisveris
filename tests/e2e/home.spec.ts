import { expect, test } from "@playwright/test";

test("home page exposes the primary marketplace journey", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Al, sat/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Elan yerləşdir|Elan/ }).first()).toBeVisible();
  await expect(page.getByText("Kateqoriyalar")).toBeVisible();
});

test("listing flow pages are reachable", async ({ page }) => {
  await page.goto("/elanlar");
  await expect(page.getByRole("heading", { name: "Elanlar" })).toBeVisible();

  await page.goto("/elan-yerlesdir");
  await expect(page.getByRole("heading", { name: "Kateqoriya" })).toBeVisible();
});
