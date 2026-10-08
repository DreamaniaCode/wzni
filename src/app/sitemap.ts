import type { MetadataRoute } from "next";
export const dynamic='force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["fr", "ar"].flatMap((locale) =>
    ["", "/confidentialite", "/conditions", "/livraison"].map((path) => ({
      url: `${site}/${locale}${path}`,
      lastModified: new Date(),
    })),
  );
}
