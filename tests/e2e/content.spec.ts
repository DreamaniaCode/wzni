import { test, expect } from "@playwright/test";
test("identical bilingual logo, real color choices, guides and social placeholders", async ({
  page,
}) => {
  async function logo() {
    return page.locator("header .brand-logo").evaluate((element) => {
      const base = element.getBoundingClientRect();
      return Array.from(element.children).map((child) => {
        const box = child.getBoundingClientRect();
        return {
          text: child.textContent,
          x: Math.round(box.x - base.x),
          y: Math.round(box.y - base.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      });
    });
  }
  await page.goto("/fr");
  await page.evaluate(() => document.fonts.ready);
  const french = await logo();
  await expect(page.locator("#conseils")).toContainText("Un");
  await expect(page.locator(".seo-section")).toContainText(
    "pèse-personne à Marrakech",
  );
  await expect(page.locator(".social-placeholder")).toHaveCount(1);
  await expect(page.locator(".social-links a")).toHaveCount(2);
  await expect(page.locator(".social-links a").first()).toHaveAttribute(
    "href",
    "https://www.facebook.com/wznimaroc",
  );
  await page
    .locator(".color-selector")
    .getByRole("button", { name: /PRIMA BLACK/ })
    .click();
  await expect(page.locator(".gallery-copy h3")).toHaveText("PRIMA BLACK");
  await page.goto("/ar");
  await page.evaluate(() => document.fonts.ready);
  expect(await logo()).toEqual(french);
  await expect(page.locator("#conseils")).toContainText("روتين بسيط");
  await expect(page.locator(".reviews-empty")).toContainText(
    "مازال ما تنشر حتى رأي",
  );
});
test("review form never says saved when PostgreSQL is unavailable", async ({
  page,
}) => {
  await page.goto("/fr");
  await page
    .locator("#avis")
    .getByRole("button", { name: "Partager mon expérience" })
    .click();
  await page.getByLabel("Nom affiché").fill("Test client");
  await page
    .getByLabel("Votre expérience (sans téléphone ni adresse)")
    .fill("Une expérience synthétique de test pour vérifier le formulaire.");
  await page.getByRole("button", { name: "Envoyer mon avis" }).click();
  await expect(page.locator(".review-form .form-error")).toContainText(
    "n’a pas été enregistré",
  );
  await expect(page.locator("#avis .success")).toHaveCount(0);
});
test("CRM controls submit bilingual text, price and social link changes", async ({
  page,
}) => {
  const fixture = {
    orders: [
      {
        id: "06bd4554-fc69-4a8b-babc-13837883cc52",
        public_reference: "WZNI-TEST-001",
        customer_name: "Client de test",
        customer_phone: "+212600000000",
        district: "Guéliz",
        delivery_address: "Adresse de test",
        delivery_notes: "",
        product_sku: "CB301-BLACK",
        quantity: 2,
        total_mad: 240,
        status: "new",
        created_at: "2026-10-09T12:00:00Z",
      },
    ],
    settings: {
      whatsapp_number: "212783009072",
      cod_enabled: false,
      chatbot_enabled: true,
      ai_chat_enabled: false,
      primary_color: "#101828",
      accent_color: "#16A34A",
      facebook_url: "",
      instagram_url: "",
      tiktok_url: "",
    },
    products: [
      {
        sku: "CB301-BLACK",
        name: "PRIMA BLACK",
        image_path: "/products/optimized/prima-black.webp",
        price_mad: 120,
        description_fr: "Noir avec motifs blancs.",
        description_ar: "أسود بزخارف بيضاء.",
        color_hex: "#151515",
        color_fr: "Noir",
        color_ar: "أسود",
        active: true,
      },
    ],
    faq: [],
    content: [],
    reviews: [],
    overview: { counts: [{ status: "new", count: 1 }], revenue: 0, best: "—" },
    ai_configured: false,
  };
  const changes: Record<string, unknown>[] = [];
  await page.route("**/api/admin", async (route) => {
    if (route.request().method() === "PATCH") {
      changes.push(route.request().postDataJSON());
      await route.fulfill({ json: { ok: true } });
    } else await route.fulfill({ json: fixture });
  });
  await page.goto("/espace-4f6c91a2e8b749d3ac025b76");
  await expect(page.locator("#crm-orders")).toBeVisible();
  await expect(page.locator("#crm-orders")).toContainText("WZNI-TEST-001");
  await expect(page.locator("#crm-products")).toBeHidden();
  await page.getByLabel("Rechercher une commande").fill("introuvable");
  await expect(page.locator(".crm-empty")).toContainText("Aucun résultat");
  await page.getByRole("button", { name: "Effacer les filtres" }).click();
  await page.screenshot({
    path: "test-results/crm-orders.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Produits (1)", exact: true }).click();
  await page.getByLabel("Prix par unité (MAD)").fill("135");
  await page.getByRole("button", { name: "Enregistrer le produit" }).click();
  await expect
    .poll(() =>
      changes.some((c) => c.type === "product" && c.price_mad === 135),
    )
    .toBe(true);
  await page.screenshot({
    path: "test-results/crm-products.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Textes et SEO", exact: true })
    .click();
  await expect(page.locator("#crm-content")).toContainText(
    "Présentation de la boutique",
  );
  await page
    .getByRole("button", { name: "Référencement Google", exact: true })
    .click();
  await expect(page.locator(".crm-seo-preview")).toContainText("wzni.store");
  await expect(page.locator("#crm-content summary").first()).toContainText(
    "Titre dans Google et les partages",
  );
  await page.screenshot({ path: "test-results/crm-seo.png", fullPage: true });
  await page
    .getByRole("button", { name: "Page d’accueil", exact: true })
    .click();
  await page
    .locator("#crm-content summary")
    .filter({ hasText: "Titre principal — première ligne" })
    .first()
    .click();
  const textForm = page.locator(".crm-text[open] form").first();
  await textForm.getByLabel("Français").fill("Titre CRM de test");
  await textForm.getByLabel("العربية").fill("عنوان تجريبي");
  await textForm
    .getByRole("button", { name: "Enregistrer les deux langues" })
    .click();
  await expect
    .poll(() =>
      changes.some(
        (c) => c.type === "content" && c.text_fr === "Titre CRM de test",
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Blog", exact: true }).click();
  await expect(page.locator("#crm-blogs")).toBeVisible();
  await expect(page.locator("#crm-content")).toBeHidden();
  await expect(page.locator("#crm-blogs")).toContainText(
    "Choisir une balance électronique à Marrakech",
  );
  await page.getByRole("button", { name: "Paramètres", exact: true }).click();
  await page
    .locator("#crm-brand")
    .getByLabel("facebook", { exact: true })
    .fill("https://www.facebook.com/wzni-test");
  await page.getByRole("button", { name: "Enregistrer la marque" }).click();
  await expect
    .poll(() =>
      changes.some(
        (c) =>
          c.type === "settings" &&
          c.facebook_url === "https://www.facebook.com/wzni-test",
      ),
    )
    .toBe(true);
  fixture.orders = [];
  fixture.overview.counts = [];
  await page.getByRole("button", { name: "Actualiser", exact: true }).click();
  await page
    .getByRole("button", { name: "Commandes (0)", exact: true })
    .click();
  await expect(page.locator(".crm-empty")).toContainText(
    "Aucune commande pour le moment",
  );
  await page
    .getByRole("button", { name: "Voir mes produits", exact: true })
    .click();
  await expect(page.locator("#crm-products")).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/crm-mobile.png",
    fullPage: true,
  });
});
