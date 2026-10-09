import { test, expect } from "@playwright/test";
test("complete bilingual metadata, icons, sitemap and no public CRM link", async ({
  page,
  request,
}) => {
  for (const path of [
    "/fr",
    "/ar",
    "/fr/blog",
    "/ar/blog/bien-utiliser-pese-personne",
    "/fr/livraison",
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      new RegExp(path.replaceAll("/", "\\/") + "$"),
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(path + "$"),
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      "/apple-touch-icon.png",
    );
    await expect(
      page.locator('a[href*="espace-"], a[href*="gestion-"]'),
    ).toHaveCount(0);
  }
  for (const path of [
    "/favicon.ico",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/social/wzni-maroc.jpg",
  ])
    expect((await request.get(path)).status()).toBe(200);
  expect((await request.get("/gestion-7c9e4b2a")).status()).toBe(404);
  const sitemap = await request.get("/sitemap.xml"),
    xml = await sitemap.text();
  expect(xml).toContain('hreflang="ar"');
  expect(xml).not.toContain("espace-");
  expect(xml).not.toContain("gestion-");
});
