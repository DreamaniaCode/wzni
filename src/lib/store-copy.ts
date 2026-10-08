import { copy, faqs } from "./i18n";
import { defaultContent, type ContentRow } from "./default-content";
import { type Locale, type Product } from "./catalog";
export function contentText(
  key: keyof typeof defaultContent,
  locale: Locale,
  rows: ContentRow[],
) {
  const row = rows.find((row) => row.key === key);
  return row
    ? locale === "fr"
      ? row.text_fr
      : row.text_ar
    : defaultContent[key][locale];
}
export function storeCopy(
  locale: Locale,
  catalog: readonly Product[],
  rows: ContentRow[],
) {
  const ar = locale === "ar";
  const active = catalog.filter((p) => p.active);
  const min = Math.min(...active.map((p) => p.price));
  const max = Math.max(...active.map((p) => p.price));
  const range = active.length
    ? `${min === max ? "" : ar ? "ابتداءً من " : "À partir de "}${min}`
    : "—";
  return {
    ...copy[locale],
    eyebrow: contentText("hero_eyebrow", locale, rows),
    headline: contentText("hero_headline", locale, rows),
    headline2: contentText("hero_headline2", locale, rows),
    intro: contentText("hero_intro", locale, rows),
    choose: contentText("collection_title", locale, rows),
    collectionText: contentText("collection_intro", locale, rows),
    closing: contentText("closing_title", locale, rows),
    announcement: ar
      ? `التوصيل مجاني فمراكش · ${range} درهم`
      : `Livraison incluse à Marrakech · ${range} DH`,
    closingText: ar
      ? `${active.length} موديلات · ${range} درهم · التوصيل مجاني فمراكش`
      : `${active.length} modèles · ${range} DH · Livraison incluse à Marrakech`,
    welcome: ar
      ? `سلام 👋 مرحبا بيك عند WZNI! اختار الموديل ديالك من موازين PRIMA. ${range} درهم والتوصيل مجاني فمراكش.`
      : `Bonjour 👋 Bienvenue chez WZNI ! Découvrez nos balances PRIMA. ${range} DH, livraison incluse à Marrakech. Comment puis-je vous aider ?`,
    chatFallback:
      catalog
        .filter((p) => p.active)
        .map((p) => `${p.name}: ${p.price} DH`)
        .join(" · ") +
      " · " +
      copy[locale].delivery,
    benefits: [
      copy[locale].benefits[0],
      copy[locale].benefits[1],
      ar ? `ثمن واضح: ${range} درهم` : `Un prix clair : ${range} DH`,
      copy[locale].benefits[3],
    ],
  };
}
export function liveFaqs(
  locale: Locale,
  catalog: readonly Product[],
  rows?: string[][],
) {
  const faq = (rows?.length ? rows : faqs(locale)).map((row) => [...row]);
  const prices = catalog
    .filter((p) => p.active)
    .map((p) => `${p.name} : ${p.price} DH`)
    .join(" · ");
  if (faq.length) faq[0][1] = prices + ". " + copy[locale].delivery;
  return faq;
}
