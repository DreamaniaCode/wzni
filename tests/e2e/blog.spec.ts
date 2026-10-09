import { test, expect } from "@playwright/test";
test("bilingual guides, social preview and private CRM route", async ({
  page,
  request,
}) => {
  await page.goto("/fr/blog/choisir-balance-marrakech");
  await expect(page.locator("h1")).toContainText("Marrakech");
  await expect(page.locator(".article-body")).toContainText("SILVER");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /social\/wzni-maroc.jpg/,
  );
  await page.goto("/ar/blog/poids-et-bien-etre");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".article-body")).toContainText("الصحة");
  expect((await request.get("/fr/blog/missing-article")).status()).toBe(404);
  expect((await request.get("/admin")).status()).toBe(404);
  await page.goto("/gestion-7c9e4b2a");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(
    "/fr/blog/bien-utiliser-pese-personne",
  );
  expect(await sitemap.text()).not.toContain("gestion-7c9e4b2a");
});
