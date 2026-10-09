import Link from "next/link";
import { articles } from "@/lib/blog";
import type { Locale } from "@/lib/catalog";
export default function BlogLinks({ locale }: { locale: Locale }) {
  return (
    <section className="section blog-section">
      <div className="eyebrow">
        WZNI · {locale === "ar" ? "دليل ونصائح" : "LE JOURNAL"}
      </div>
      <h2>
        {locale === "ar"
          ? "اختار واستعمل الميزان بوعي"
          : "Choisir, utiliser, prendre du recul"}
      </h2>
      <div className="usage-grid">
        {articles.map((article) => (
          <article key={article.slug}>
            <h3>
              <Link href={`/${locale}/blog/${article.slug}`}>
                {article.title[locale]}
              </Link>
            </h3>
            <p>{article.description[locale]}</p>
            <Link
              className="text-link"
              href={`/${locale}/blog/${article.slug}`}
            >
              {locale === "ar" ? "قرا المقال" : "Lire le guide"} →
            </Link>
          </article>
        ))}
      </div>
      <Link className="text-link" href={`/${locale}/blog`}>
        {locale === "ar" ? "جميع المقالات" : "Tous les articles"} →
      </Link>
    </section>
  );
}
