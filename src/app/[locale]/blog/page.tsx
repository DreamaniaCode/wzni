import type { Metadata } from "next";
import Link from "next/link";
import BlogLinks from "@/components/blog-links";
import BrandLogo from "@/components/brand-logo";
import { siteUrl } from "@/lib/site-url";
import type { Locale } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(siteUrl()),
    title:
      locale === "ar"
        ? "دليل ميزان الوزن | وزني مراكش"
        : "Guides et conseils sur les balances | WZNI Marrakech",
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { fr: "/fr/blog", ar: "/ar/blog" },
    },
    openGraph: { images: ["/social/wzni-maroc.jpg"] },
  };
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <main className="blog-page">
      <header className="section">
        <Link href={`/${locale}`}>
          <BrandLogo />
        </Link>
        <h1>{locale === "ar" ? "مجلة وزني" : "Le journal WZNI"}</h1>
      </header>
      <BlogLinks locale={locale} />
    </main>
  );
}
