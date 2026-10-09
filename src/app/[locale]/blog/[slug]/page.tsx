import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import BlogLinks from "@/components/blog-links";
import { articles } from "@/lib/blog";
import type { Locale } from "@/lib/catalog";
import { publicData } from "@/lib/server";
import { contentText } from "@/lib/store-copy";
import { siteUrl } from "@/lib/site-url";
import { pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ locale: Locale; slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params,
    article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return pageMetadata(
    locale,
    `/blog/${slug}`,
    article.title[locale] + " | WZNI",
    article.description[locale],
    "article",
  );
}
export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params,
    article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const { content } = await publicData(),
    url = `${siteUrl()}/${locale}/blog/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title[locale],
    description: article.description[locale],
    inLanguage: locale,
    mainEntityOfPage: url,
    image: siteUrl() + "/social/wzni-maroc.jpg",
    author: { "@type": "Organization", name: "WZNI", url: siteUrl() },
    publisher: { "@type": "Organization", name: "WZNI" },
  };
  return (
    <main className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="section">
        <Link href={`/${locale}`}>
          <BrandLogo />
        </Link>
      </header>
      <article className="section article-body">
        <Link className="text-link" href={`/${locale}/blog`}>
          {locale === "ar" ? "المجلة" : "Le journal"}
        </Link>
        <h1>{article.title[locale]}</h1>
        <p className="article-intro">{article.description[locale]}</p>
        {contentText(article.key, locale, content)
          .split("\n\n")
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        {article.key !== "blog_choose" && (
          <p className="guidance-source">
            <a
              href={
                article.key === "blog_use"
                  ? "https://www.england.nhs.uk/long-read/how-to-record-your-weight/"
                  : "https://www.nhs.uk/live-well/healthy-weight/"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === "ar" ? "المصدر: NHS" : "Source : NHS"}
            </a>
          </p>
        )}
        <Link className="text-link" href={`/${locale}#modeles`}>
          {locale === "ar"
            ? "شوف موازين PRIMA"
            : "Découvrir les balances PRIMA"}{" "}
          →
        </Link>
      </article>
      <BlogLinks locale={locale} />
    </main>
  );
}
