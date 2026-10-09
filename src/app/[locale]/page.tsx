import type { Metadata } from "next";
import Storefront from "@/components/storefront";
import { type Locale } from "@/lib/catalog";
import { publicData } from "@/lib/server";
import { contentText } from "@/lib/store-copy";
import { siteUrl } from "@/lib/site-url";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { content } = await publicData();
  const title = contentText("seo_meta_title", locale, content);
  const description = contentText("seo_meta_description", locale, content);
  return {
    ...pageMetadata(locale, "", title, description),
    keywords:
      locale === "fr"
        ? [
            "balance électronique Marrakech",
            "pèse-personne Marrakech",
            "balance PRIMA Marrakech",
          ]
        : ["ميزان إلكتروني مراكش", "ميزان الوزن مراكش", "ميزان PRIMA"],
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { catalog, store, content, faq, reviews } = await publicData();
  const site = siteUrl();
  const structured = catalog
    .filter((p) => p.active)
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      sku: p.sku,
      image: site + p.image,
      description: locale === "ar" ? p.descriptionAr : p.descriptionFr,
      color: locale === "ar" ? p.colorAr : p.colorFr,
      brand: { "@type": "Brand", name: "PRIMA" },
      offers: {
        "@type": "Offer",
        price: String(p.price),
        priceCurrency: "MAD",
        url: site + "/" + locale,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: "MAD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "MA",
            addressRegion: "Marrakech",
          },
        },
      },
    }));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...structured,
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WZNI | وزني",
              url: site,
              logo: site + "/social/wzni-maroc.jpg",
              sameAs: [
                store?.facebook_url || "https://www.facebook.com/wznimaroc",
                store?.instagram_url || "https://www.instagram.com/wznimaroc/",
              ],
            },
          ]).replace(/</g, "\\u003c"),
        }}
      />
      <Storefront
        locale={locale}
        catalog={catalog}
        store={store || {}}
        content={content}
        reviews={reviews}
        faqRows={faq.map((f) =>
          locale === "ar"
            ? [f.question_ar, f.answer_ar]
            : [f.question_fr, f.answer_fr],
        )}
      />
    </>
  );
}
