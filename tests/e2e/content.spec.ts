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
  await expect(page.locator(".social-placeholder")).toHaveCount(3);
  await expect(page.locator(".social-links a")).toHaveCount(0);
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
    orders: [],
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
    overview: { counts: [], revenue: 0, best: "—" },
    ai_configured: false,
  };
  const changes: Record<string, unknown>[] = [];
  await page.route("**/api/admin", async (route) => {
    if (route.request().method() === "PATCH") {
      changes.push(route.request().postDataJSON());
      await route.fulfill({ json: { ok: true } });
    } else await route.fulfill({ json: fixture });
  });
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Ouvrir ma session existante" })
    .click();
  await page.getByLabel("Prix par unité (MAD)").fill("135");
  await page.getByRole("button", { name: "Enregistrer le produit" }).click();
  await expect
    .poll(() =>
      changes.some((c) => c.type === "product" && c.price_mad === 135),
    )
    .toBe(true);
  await page
    .locator("#crm-content summary")
    .filter({ hasText: "hero headline" })
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
});
