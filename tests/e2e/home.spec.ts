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

test("catalog filters apply immediately and clear completely", async ({ page }, testInfo) => {
  await page.goto("/elanlar");

  await expect(page.getByText("8 elan göstərilir")).toBeVisible();
  await expect(page.getByRole("button", { name: "Növbəti səhifə" })).toHaveCount(0);

  if (testInfo.project.name === "mobile") {
    await page.getByTestId("open-mobile-filters").click();
    await expect(page.getByTestId("mobile-filter-drawer")).toBeVisible();
  }

  const filterScope =
    testInfo.project.name === "mobile"
      ? page.getByTestId("mobile-filter-drawer")
      : page.locator("aside").first();

  await filterScope.getByLabel("Mağaza", { exact: true }).check();
  await filterScope.getByLabel("Çatdırılma var", { exact: true }).check();

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Nəticələri göstər" }).click();
  }

  await expect(page.getByText("2 elan göstərilir")).toBeVisible();
  await expect(page.getByText("Samsung QLED 55 Smart TV")).toHaveCount(0);

  await page.getByTestId("clear-all-filters").click();
  await expect(page.getByText("8 elan göstərilir")).toBeVisible();
  await expect(page.getByText("Aktiv filter yoxdur.")).toBeVisible();
});

test("listing promotion services open price modals", async ({ page }) => {
  await page.goto("/elan/macbook-air-m3-13-16gb");

  await page.getByTestId("promotion-panel").getByRole("button", { name: /VIP et/ }).click();
  await expect(page.getByRole("dialog")).toContainText("VIP et");
  await expect(page.getByRole("dialog")).toContainText("15 gün / 11,00 ₼");
  await page.getByRole("button", { name: "Bağla" }).click();

  await page.getByTestId("promotion-panel").getByRole("button", { name: /Premium et/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Premium et");
  await expect(page.getByRole("dialog")).toContainText("15 gün / 22,00 ₼");
  await expect(page.getByRole("dialog")).toContainText("Bank kartı");
  await page.getByRole("button", { name: "Bağla" }).click();

  await page.getByTestId("promotion-panel").getByRole("button", { name: /İrəli çək/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Elanı irəli çək");
  await expect(page.getByRole("dialog")).toContainText("3 dəfə (8 saatdan bir) / 0,70 ₼");
});

test("messages search, send and validation work", async ({ page }) => {
  await page.goto("/mesajlar");

  await page.getByPlaceholder("Mesaj yaz").fill("Salam, bu gun goture bilerem?");
  await page.getByRole("button", { name: "Göndər", exact: true }).click();
  await expect(page.getByText("Mesaj göndərildi.")).toBeVisible();
  await expect(page.getByTestId("message-thread")).toContainText(
    "Salam, bu gun goture bilerem?",
  );

  await page.getByPlaceholder("Mesaj yaz").fill("");
  await page.getByRole("button", { name: "Göndər", exact: true }).click();
  await expect(page.getByText("Mesaj boş ola bilməz.")).toBeVisible();

  await page.getByLabel("Mesajlarda axtar").fill("City");
  await expect(page.getByRole("button", { name: /City Home/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Kamran/ })).toHaveCount(0);
});

test("admin sections and listing actions work", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("alisveris-admin-session-v1", "active");
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Elanların idarəsi" }).click();
  await page.getByTestId("view-lst-001").click();
  await expect(page.getByTestId("selected-listing")).toContainText("iPhone 15 Pro Max");
  await page.getByTestId("approve-lst-001").click();
  await expect(page.getByTestId("listing-status-lst-001")).toContainText("Təsdiqləndi");
  await page.getByTestId("reject-lst-001").click();
  await expect(page.getByTestId("listing-status-lst-001")).toContainText("Rədd edildi");

  await page.getByRole("button", { name: "İstifadəçilər" }).click();
  await page.getByTestId("role-usr-3").click();
  await expect(page.getByText("admin · Fərdi · 4 elan")).toBeVisible();
  await page.getByTestId("block-usr-3").click();
  await expect(page.getByText("bloklandı").first()).toBeVisible();

  await page.getByRole("button", { name: "Kateqoriyalar" }).click();
  await page.getByRole("button", { name: "Kateqoriya əlavə et" }).click();
  await expect(page.getByTestId("category-count")).toContainText("16 kateqoriya");
  await page.getByRole("button", { name: "Telefon atributları Marka, model, rəng, status, seçim və validation." }).click();
  await expect(page.getByTestId("selected-attribute")).toContainText("Telefon atributları");

  await page.getByRole("button", { name: "Moderasiya" }).click();
  await page.getByRole("button", { name: "Spam elanlar Bax və tədbir gör" }).click();
  await expect(page.getByTestId("moderation-selection")).toContainText("Spam elanlar");

  await page.getByRole("button", { name: "Mağazalar" }).click();
  await page.getByTestId("store-approve-store-001").click();
  await expect(page.getByText("təsdiqləndi").first()).toBeVisible();
  await page.getByRole("button", { name: "Statistika" }).first().click();
  await expect(page.getByTestId("store-stats")).toContainText("Telefon Dünyası");

  await page.getByRole("button", { name: "Ödənişlər" }).click();
  await expect(page.getByText("Transaction siyahısı")).toBeVisible();
  await page.getByTestId("invoice-TX-1002").click();
  await expect(page.getByTestId("invoice-output")).toContainText("TX-1002 fakturası");
  await page.getByRole("button", { name: "Tamamla" }).click();
  await expect(page.getByText("completed").first()).toBeVisible();

  await page.getByRole("button", { name: "CMS" }).click();
  await page.getByRole("button", { name: "FAQ" }).click();
  await expect(page.getByTestId("cms-output")).toContainText("FAQ redaktə paneli");
});

test("listing wizard shows field-specific errors and uploads images", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alisveris-safe-profiles-v1",
      JSON.stringify([
        {
          id: "e2e-user",
          name: "E2E İstifadəçi",
          accountType: "individual",
        },
      ]),
    );
    window.localStorage.setItem("alisveris-demo-session-v1", "e2e-user");
  });
  await page.goto("/elan-yerlesdir");

  await expect(
    page.getByRole("button", { name: "Kateqoriya seçin", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Alt kateqoriya seçin", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Məhsul məlumatları/ }).click();
  await page.getByLabel("Elanın adı").fill("");
  await page.getByRole("button", { name: "Ön baxış" }).click();
  await page.getByRole("button", { name: "Elanı dərc et" }).click();
  await expect(page.getByText("Elan adı ən azı 8 simvol olmalıdır")).toBeVisible();
  await expect(page.getByText("Formda düzəldilməli sahələr var. Zəhmət olmasa məlumatları yoxlayın.")).toHaveCount(0);

  await page.getByLabel("Elanın adı").fill("Test üçün iPhone 15 Pro Max");
  await page.getByRole("button", { name: "Şəkillər" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "elan.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByText("elan.png")).toBeVisible();
  await expect(page.getByRole("button", { name: "Əsas" })).toBeVisible();
});
