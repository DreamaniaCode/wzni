import type { Metadata } from "next";
import type { Locale } from "./catalog";
import { siteUrl } from "./site-url";
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  type: "website" | "article" = "website",
): Metadata {
  const image = {
    url: "/social/wzni-maroc.jpg",
    width: 2048,
    height: 2048,
    alt: "WZNI | وزني — @wznimaroc",
  };
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        fr: `/fr${path}`,
        ar: `/ar${path}`,
        "x-default": `/fr${path}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type,
      title,
      description,
      url: `/${locale}${path}`,
      siteName: "WZNI | وزني",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      alternateLocale: locale === "ar" ? "fr_MA" : "ar_MA",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
