import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import { blogCopy, type BlogArticle } from "@/lib/blog";
import { BlogContent } from "./blog-content";
import { BlogGallery } from "./blog-gallery";
import { BlogCard } from "./blog-card";

export function BlogDetail({ article, locale }: { article: BlogArticle; locale: string }) {
  const copy = blogCopy(locale);
  const cover = article.media.find((image) => image.id === article.coverMediaId);
  const src = mediaUrl(cover?.path ?? null);
  return (
    <main className="section article-page">
      <article className="article-shell">
        <header className="article-heading">
          <Link className="card-link" href={`/${locale}/blog`}>
            {copy.back}
          </Link>
          <span className="eyebrow">LIFE STEEL JOURNAL</span>
          <h1>{article.title}</h1>
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>
              {new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              }).format(new Date(article.publishedAt))}
            </time>
          )}
          {article.summary && <p className="lead">{article.summary}</p>}
          <div className="article-chips">
            {article.categories.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/blog?categoryId=${encodeURIComponent(item.id)}`}
              >
                {item.title}
              </Link>
            ))}
            {article.tags.map((item) => (
              <Link key={item.id} href={`/${locale}/blog?tagId=${encodeURIComponent(item.id)}`}>
                #{item.title}
              </Link>
            ))}
          </div>
          {article.translations.length > 1 && (
            <nav className="article-chips" aria-label={copy.translations}>
              {article.translations.map((translation) => (
                <Link
                  key={translation.language}
                  href={`/${translation.language}/blog/${encodeURIComponent(translation.slug)}`}
                  hrefLang={translation.language}
                  aria-current={translation.language === locale ? "page" : undefined}
                >
                  {translation.language.toUpperCase()}
                </Link>
              ))}
            </nav>
          )}
        </header>
        {src && (
          <div className="article-cover">
            <Image
              src={src}
              alt={cover?.translations[0]?.altText ?? article.title}
              width={cover?.width ?? 1200}
              height={cover?.height ?? 1200}
              preload
              sizes="(max-width: 900px) 100vw, 850px"
            />
          </div>
        )}
        <BlogContent content={article.content} media={article.media} />
        <BlogGallery images={article.media} locale={locale} title={article.title} />
      </article>
      {article.related.length > 0 && (
        <section className="article-related">
          <div className="section-heading">
            <h2>{copy.related}</h2>
          </div>
          <div className="product-grid">
            {article.related.map((item) => (
              <BlogCard key={item.id} article={item} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
