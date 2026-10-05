import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { mediaUrl } from "@/lib/api";
import { blogCopy, type BlogCardData, type BlogFilters, type BlogTaxonomy } from "@/lib/blog";
import { blogListingCopy } from "../blog-listing.copy";
import { blogListingHref } from "../lib/blog-listing-query";

export function BlogFilterPanel({
  locale,
  filters,
  categories,
  tags,
  latest,
}: {
  locale: string;
  filters: BlogFilters;
  categories: BlogTaxonomy[];
  tags: BlogTaxonomy[];
  latest: BlogCardData[];
}) {
  const copy = blogCopy(locale);
  const listingCopy = blogListingCopy(locale);
  const hasFilters = Boolean(filters.search || filters.categoryId || filters.tagId);

  return (
    <div className="space-y-5">
      <section className="rounded-[20px] border border-line bg-surface p-5">
        <h2 className="text-base font-black text-content-strong">{listingCopy.filters}</h2>
        <form className="mt-4" action={`/${locale}/blog`} method="get">
          {filters.categoryId && (
            <input type="hidden" name="categoryId" value={filters.categoryId} />
          )}
          {filters.tagId && <input type="hidden" name="tagId" value={filters.tagId} />}
          <label className="flex h-11 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
            <FiSearch className="shrink-0 text-content-subtle" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-content-strong outline-none placeholder:text-content-subtle"
              aria-label={listingCopy.search}
              name="search"
              maxLength={200}
              defaultValue={filters.search ?? ""}
              placeholder={listingCopy.search}
            />
          </label>
          <button
            className="mt-3 min-h-10 w-full rounded-xl bg-brand px-4 text-sm font-extrabold text-white transition-colors hover:bg-brand-hover"
            type="submit"
          >
            {listingCopy.searchButton}
          </button>
        </form>
        {hasFilters && (
          <Link
            className="mt-3 block text-center text-xs font-bold text-content-muted transition-colors hover:text-brand"
            href={`/${locale}/blog`}
          >
            {copy.clear}
          </Link>
        )}
      </section>

      <section className="rounded-[20px] border border-line bg-surface p-5">
        <h2 className="text-base font-black text-content-strong">{listingCopy.categories}</h2>
        <nav className="mt-3 space-y-1" aria-label={listingCopy.categories}>
          <Link
            className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${!filters.categoryId ? "bg-brand/10 text-brand-strong" : "text-content-muted hover:bg-surface-muted hover:text-content-strong"}`}
            href={blogListingHref(locale, filters, { categoryId: null, page: null })}
          >
            {listingCopy.all}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${filters.categoryId === category.id ? "bg-brand/10 text-brand-strong" : "text-content-muted hover:bg-surface-muted hover:text-content-strong"}`}
              href={blogListingHref(locale, filters, {
                categoryId: category.id,
                page: null,
              })}
            >
              {category.title}
            </Link>
          ))}
        </nav>
      </section>

      {tags.length > 0 && (
        <section className="rounded-[20px] border border-line bg-surface p-5">
          <h2 className="text-base font-black text-content-strong">{listingCopy.tags}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${filters.tagId === tag.id ? "bg-brand text-white" : "bg-surface-muted text-content-muted hover:text-content-strong"}`}
                href={blogListingHref(locale, filters, {
                  tagId: filters.tagId === tag.id ? null : tag.id,
                  page: null,
                })}
              >
                {tag.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="rounded-[20px] border border-line bg-surface p-5">
          <h2 className="text-base font-black text-content-strong">{listingCopy.latest}</h2>
          <div className="mt-4 space-y-4">
            {latest.map((article) => {
              const image = mediaUrl(article.cover?.path ?? null);
              return (
                <Link
                  className="group flex items-center gap-3"
                  href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}
                  key={article.id}
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                    {image ? (
                      <Image
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        src={image}
                        alt=""
                        fill
                        sizes="56px"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-xs font-black text-content-muted">
                        LS
                      </span>
                    )}
                  </span>
                  <span className="line-clamp-2 text-xs leading-6 font-extrabold text-content-strong transition-colors group-hover:text-brand">
                    {article.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
