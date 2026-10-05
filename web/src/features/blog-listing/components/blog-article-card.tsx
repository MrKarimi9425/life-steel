import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { mediaUrl } from "@/lib/api";
import { blogCopy, type BlogCardData } from "@/lib/blog";
import { blogListingCopy } from "../blog-listing.copy";
import { formatBlogDate } from "../lib/blog-date";

export function BlogArticleCard({ article, locale }: { article: BlogCardData; locale: string }) {
  const copy = blogCopy(locale);
  const listingCopy = blogListingCopy(locale);
  const image = mediaUrl(article.cover?.path ?? null);
  const date = formatBlogDate(article.publishedAt, locale);
  const isRtl = locale === "fa" || locale === "ar";
  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-line bg-surface transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        className="relative block aspect-[1.12/1] overflow-hidden bg-surface-soft"
        href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}
        aria-label={article.title}
      >
        {image ? (
          <Image
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
            src={image}
            alt={article.cover?.translations[0]?.altText ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 30vw"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-surface-muted to-surface-soft text-4xl font-black text-content-muted">
            LS
          </span>
        )}
        <span className="absolute top-3 end-3 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">
          {listingCopy.article}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-[17px] leading-8 font-black text-content-strong">
          <Link href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}>{article.title}</Link>
        </h2>
        {article.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-content-muted">
            {article.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {date ? (
            <time
              className="inline-flex items-center gap-1.5 text-xs text-content-subtle"
              dateTime={article.publishedAt ?? undefined}
            >
              <FiCalendar aria-hidden="true" />
              {date}
            </time>
          ) : (
            <span />
          )}
          <Link
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-surface-muted px-3 text-xs font-extrabold text-content-strong transition-colors hover:bg-brand hover:text-white"
            href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}
          >
            {copy.read}
            <Arrow aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
