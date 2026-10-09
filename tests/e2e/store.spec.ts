import { test, expect } from "@playwright/test";
test("cart persists, keeps its model, and starts checkout only on confirmation", async ({
  page,
}) => {
  await page.route("https://connect.facebook.net/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.goto("/fr");
  await page
    .locator(".consent")
    .getByRole("button", { name: "Accepter", exact: true })
    .click();
  await expect(page.locator("#commander")).toBeHidden();
  await page
    .locator(".gallery-copy")
    .getByRole("button", { name: "Ajouter au panier" })
    .click();
  await expect(page.locator(".cart-card")).toContainText("CB301-BLACK");
  expect(
    await page.evaluate(
      () => window.fbq?.queue.filter((a) => a[1] === "AddToCart").length,
    ),
  ).toBe(1);
  expect(
    await page.evaluate(
      () => window.fbq?.queue.filter((a) => a[1] === "InitiateCheckout").length,
    ),
  ).toBe(0);
  await page
    .getByRole("spinbutton", { name: "Quantité dans le panier" })
    .fill("2");
  await page.reload();
  await expect(
    page.getByRole("spinbutton", { name: "Quantité dans le panier" }),
  ).toHaveValue("2");
  await expect(page.locator(".consent")).toBeHidden();
  await page
    .locator(".product-card")
    .first()
    .getByRole("button", { name: "Choisir ce modèle", exact: true })
    .click();
  await expect(page.locator(".cart-card")).toContainText("CB301-BLACK");
  await page.getByRole("button", { name: "Passer à la commande" }).click();
  await expect(page.locator(".order-summary")).toContainText("CB301-BLACK");
  await expect(page.locator(".summary-total")).toContainText("240 DH");
  expect(
    await page.evaluate(
      () => window.fbq?.queue.filter((a) => a[1] === "InitiateCheckout").length,
    ),
  ).toBe(1);
  await page.getByRole("button", { name: "Modifier le panier" }).click();
  await page.getByRole("button", { name: "Retirer du panier" }).click();
  await expect(page.locator("#panier")).toContainText("Votre panier est vide");
  await expect(page.locator("#commander")).toBeHidden();
  await page.reload();
  await expect(page.locator("#panier")).toContainText("Votre panier est vide");
});

test("French selection, quantity, honest offline checkout, chat and Arabic RTL", async ({
  page,
}) => {
  await page.goto("/fr");
  await expect(page.locator("h1")).toContainText("Votre poids");
  await page
    .locator(".product-card")
    .nth(0)
    .locator(".product-picture")
    .click();
  await page
    .locator(".product-card")
    .nth(2)
    .getByRole("button", { name: "Choisir ce modèle", exact: true })
    .click();
  await page
    .locator(".gallery-copy")
    .getByRole("button", { name: "Ajouter au panier" })
    .click();
  await expect(page.locator("#commander")).toBeHidden();
  await page
    .getByRole("spinbutton", { name: "Quantité dans le panier" })
    .fill("2");
  await page.getByRole("button", { name: "Passer à la commande" }).click();
  await expect(page.locator(".summary-total")).toContainText("240 DH");
  await page.getByRole("textbox", { name: "Nom complet" }).fill("Client test");
  await page
    .getByRole("textbox", { name: "Téléphone marocain" })
    .fill("0612345678");
  await page
    .getByLabel("Quartier de Marrakech", { exact: true })
    .selectOption("Guéliz");
  await page
    .getByRole("textbox", { name: "Adresse de livraison" })
    .fill("123 rue de test Marrakech");
  await page.getByRole("button", { name: "Envoyer ma commande" }).click();
  await expect(page.locator(".form-error")).toContainText(
    "momentanément indisponible",
  );
  await expect(page.locator(".success")).toHaveCount(0);
  await page.getByRole("button", { name: "WZNI Assistant" }).click();
  await expect(page.locator(".chat-panel")).toBeVisible();
  await page
    .locator(".quick-actions")
    .getByRole("button", { name: "Le prix" })
    .click();
  await expect(page.locator(".chat-messages")).toContainText(
    "120 DH par unité",
  );
  const href = await page.locator(".wa-launcher").getAttribute("href");
  expect(decodeURIComponent(href || "")).toContain("240 DH");
  await page.getByRole("link", { name: "العربية", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("h1")).toContainText("وزنك");
  await page.getByRole("link", { name: "FR", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
test("admin and order API reject unauthorized or invalid requests", async ({
  request,
}) => {
  const admin = await request.get("/api/admin");
  expect([401, 503]).toContain(admin.status());
  const mutation = await request.patch("/api/admin", {
    data: { type: "status", id: "fake", status: "delivered" },
  });
  expect(mutation.status()).toBe(403);
  const order = await request.post("/api/orders", {
    headers: { Origin: "http://localhost:3000" },
    data: { quantity: 2, total_mad: 1 },
  });
  expect(order.status()).toBe(400);
});
test("mobile has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fr");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-fr.png", fullPage: true });
  await page.goto("/ar");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-ar.png", fullPage: true });
});
