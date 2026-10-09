// Browser regression against a running, stocked storefront. Orders are intercepted.
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  let submitted;
  await page.route("**/api/orders", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        reference: "WZ-LOCAL-TEST",
        total: submitted.items.reduce(
          (n, i) => n + i.quantity * i.expected_unit_price,
          0,
        ),
      }),
    });
  });
  await page.route("https://connect.facebook.net/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  const base = process.env.CART_TEST_URL || "http://localhost:3001";
  await page.goto(base + "/fr");
  await expect(page.locator(".consent")).toBeVisible();
  await page
    .locator(".consent")
    .getByRole("button", { name: "Refuser", exact: true })
    .click();
  await page
    .locator(".gallery-copy")
    .getByRole("button", { name: "Ajouter au panier" })
    .click();
  await page
    .getByRole("spinbutton", { name: "Quantité PRIMA BLACK" })
    .fill("2");
  await page
    .locator(".product-card")
    .first()
    .getByRole("button", { name: "Choisir ce modèle", exact: true })
    .click();
  await page
    .locator(".gallery-copy")
    .getByRole("button", { name: "Ajouter au panier" })
    .click();
  await expect(page.locator(".cart-card")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".cart-card")).toHaveCount(2);
  await expect(
    page.getByRole("spinbutton", { name: "Quantité PRIMA BLACK" }),
  ).toHaveValue("2");
  await page
    .locator("#panier")
    .screenshot({ path: "test-results/multi-cart.png" });
  await page.getByRole("button", { name: "Passer à la commande" }).click();
  await expect(page.locator(".order-summary")).toContainText("PRIMA BLACK × 2");
  await expect(page.locator(".order-summary")).toContainText(
    "PRIMA SILVER × 1",
  );
  await page.getByRole("textbox", { name: "Nom complet" }).fill("Test local");
  await page
    .getByRole("textbox", { name: "Téléphone marocain" })
    .fill("0612345678");
  await page
    .getByLabel("Quartier de Marrakech", { exact: true })
    .selectOption("Guéliz");
  await page
    .getByRole("textbox", { name: "Adresse de livraison" })
    .fill("Adresse de test locale");
  await page.getByRole("button", { name: "Envoyer ma commande" }).click();
  await expect(page.locator(".success")).toContainText("WZ-LOCAL-TEST");
  expect(submitted.items).toHaveLength(2);
  expect(submitted.items.find((i) => i.sku === "CB301-BLACK").quantity).toBe(2);
  await expect(page.locator("#panier")).toContainText("Votre panier est vide");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  console.log(
    "PASS: multi-product cart, persistence, line quantities, simulated checkout, clear-on-success and mobile RTL. No order written.",
  );
} finally {
  await browser.close();
}
