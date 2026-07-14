import { expect, test } from "@playwright/test";

test("home page exposes the primary marketplace journey", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Al, sat/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Elan yerləşdir|Elan/ }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kateqoriyalar" })).toBeVisible();
});

test("listing flow pages are reachable", async ({ page }) => {
  await page.goto("/elanlar");
  await expect(page.getByRole("heading", { name: "Elanlar" })).toBeVisible();

  await page.goto("/elan-yerlesdir");
  await expect(page.getByRole("heading", { name: "Kateqoriya" })).toBeVisible();
});

test("catalog filters and detail gallery work", async ({ page }) => {
  await page.goto("/elanlar?q=iphone");
  await expect(page.getByText("iPhone 15 Pro Max 256GB")).toBeVisible();

  await expect(page.getByRole("link", { name: "iPhone 15 Pro Max 256GB, Natural Titanium" })).toBeVisible();

  await page.goto("/elan/iphone-15-pro-max-256gb");
  await page.getByRole("button", { name: "Fullscreen" }).click();
  await expect(page.getByRole("button", { name: "Bağla" })).toBeVisible();
});

test("admin sections and listing actions work", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Elanların idarəsi" }).click();
  await page.getByTestId("approve-lst-001").click();
  await expect(page.getByText("Təsdiqləndi").first()).toBeVisible();

  await page.getByRole("button", { name: "Ödənişlər" }).click();
  await expect(page.getByText("Transaction siyahısı")).toBeVisible();
});
