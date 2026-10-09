import type { Metadata } from "next";
import Link from "next/link";
import BlogLinks from "@/components/blog-links";
import BrandLogo from "@/components/brand-logo";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/blog",
    locale === "ar"
      ? "دليل ميزان الوزن | وزني مراكش"
      : "Guides et conseils sur les balances | WZNI Marrakech",
    locale === "ar"
      ? "نصائح وزني لاختيار ميزان الوزن واستعماله فالدار، مع معلومات عامة على الصحة والتوصيل فمراكش."
      : "Les guides WZNI pour choisir une balance électronique, utiliser son pèse-personne à la maison et garder du recul sur son poids. Livraison à Marrakech.",
  );
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
