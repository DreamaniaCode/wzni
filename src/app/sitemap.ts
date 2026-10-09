import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { articles } from "@/lib/blog";
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return ["fr", "ar"].flatMap((locale) =>
    [
      "",
      "/confidentialite",
      "/conditions",
      "/livraison",
      "/blog",
      ...articles.map((a) => "/blog/" + a.slug),
    ].map((path) => ({
      url: `${site}/${locale}${path}`,
    })),
  );
}
