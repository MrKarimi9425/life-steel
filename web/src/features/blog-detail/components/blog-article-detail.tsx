import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { BlogCard } from "@/components/blog-card";
import { BlogContent } from "@/components/blog-content";
import { BlogGallery } from "@/components/blog-gallery";
import { ContentPanel } from "@/components/content-panel";
import { SiteContainer } from "@/components/site-container";
import { mediaUrl } from "@/lib/api";
import { blogCopy, type BlogArticle } from "@/lib/blog";

export function BlogArticleDetail({ article, locale }: { article: BlogArticle; locale: string }) {
  const copy = blogCopy(locale);
  const cover = article.media.find((image) => image.id === article.coverMediaId);
  const coverSource = mediaUrl(cover?.path ?? null);
  const isRtl = locale === "fa" || locale === "ar";
  const BackArrow = isRtl ? FiArrowRight : FiArrowLeft;
  const publishedDate = article.publishedAt
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(article.publishedAt))
    : null;

  return (
    <main className="bg-surface py-14 sm:py-9 lg:py-10">
      <SiteContainer>
        <ContentPanel as="article">
          <h1 className="my-5 text-[32px] leading-[1.45] font-bold text-content-strong [overflow-wrap:anywhere]">
            {article.title}
          </h1>

          {coverSource && (
            <div className="relative aspect-[1.386/1] overflow-hidden rounded-[28px] bg-surface-muted">
              <Image
                className="object-cover"
                src={coverSource}
                alt={cover?.translations[0]?.altText ?? article.title}
                fill
                loading="eager"
                sizes="(max-width: 640px) calc(100vw - 72px), (max-width: 1200px) calc(100vw - 104px), 1057px"
              />
            </div>
          )}

          {article.summary && (
            <p className="mt-8 mb-0 text-base leading-8 text-content">{article.summary}</p>
          )}

          <BlogContent content={article.content} media={article.media} />
          <BlogGallery images={article.media} locale={locale} title={article.title} />

          <footer className="mt-10 border-t border-line-soft pt-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-content-muted">
              {publishedDate && (
                <time
                  className="inline-flex items-center gap-2"
                  dateTime={article.publishedAt ?? undefined}
                >
                  <FiCalendar aria-hidden="true" />
                  {publishedDate}
                </time>
              )}
              {article.categories.map((category) => (
                <Link
                  className="font-bold text-content transition-colors hover:text-brand"
                  key={category.id}
                  href={`/${locale}/blog?categoryId=${encodeURIComponent(category.id)}`}
                >
                  {category.title}
                </Link>
              ))}
              {article.tags.map((tag) => (
                <Link
                  className="font-bold text-content transition-colors hover:text-brand"
                  key={tag.id}
                  href={`/${locale}/blog?tagId=${encodeURIComponent(tag.id)}`}
                >
                  #{tag.title}
                </Link>
              ))}
            </div>

            <Link
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-surface-muted px-4 text-sm font-extrabold text-content-strong transition-colors hover:bg-brand hover:text-white"
              href={`/${locale}/blog`}
            >
              <BackArrow aria-hidden="true" />
              {copy.back}
            </Link>
          </footer>
        </ContentPanel>

        {article.related.length > 0 && (
          <section className="mx-auto mt-16 max-w-[1115px]" aria-labelledby="related-articles">
            <h2
              className="mb-7 text-2xl leading-10 font-black text-content-strong sm:text-[28px]"
              id="related-articles"
            >
              {copy.related}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {article.related.map((item) => (
                <BlogCard key={item.id} article={item} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </SiteContainer>
    </main>
  );
}
