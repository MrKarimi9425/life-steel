import type { Metadata } from "next";
import { SiteContainer } from "@/components/site-container";
import { BlogArticleCard } from "@/features/blog-listing/components/blog-article-card";
import { BlogFilterDrawer } from "@/features/blog-listing/components/blog-filter-drawer";
import { BlogFilterPanel } from "@/features/blog-listing/components/blog-filter-panel";
import { BlogListingPagination } from "@/features/blog-listing/components/blog-listing-pagination";
import { blogListingCopy } from "@/features/blog-listing/blog-listing.copy";
import { activeBlogFilterCount } from "@/features/blog-listing/lib/blog-listing-query";
import { ResponsiveBanner } from "@/features/home-banners/components/responsive-banner";
import { getLanguages } from "@/lib/api";
import { listingQuery, pageSeo } from "@/lib/page-seo";
import {
  blogCopy,
  getBlogArticles,
  getBlogTaxonomies,
  type BlogFilters as Filters,
} from "@/lib/blog";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
type Params = Promise<{ locale: string }>;
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const languages = await getLanguages();
  const query = listingQuery(await searchParams, ["search", "categoryId", "tagId", "page"]);
  return pageSeo({
    path: `/${locale}/blog${query}`,
    title: blogCopy(locale).blog,
    description: blogCopy(locale).introduction,
    languagePaths: Object.fromEntries(
      languages.map((language) => [language.code, `/${language.code}/blog${query}`]),
    ),
  });
}
export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const incoming = await searchParams;
  const filters: Filters = {};
  for (const key of ["search", "categoryId", "tagId"] as const) {
    const value = incoming[key];
    if (typeof value === "string" && value.trim()) filters[key] = value.trim().slice(0, 200);
  }
  const requestedPage = typeof incoming.page === "string" ? Number(incoming.page) : 1;
  filters.page = String(
    Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 1000000
      ? requestedPage
      : 1,
  );
  const hasFilters = Boolean(filters.search || filters.categoryId || filters.tagId);
  const [result, options, latestResult, siteContent] = await Promise.all([
    getBlogArticles(locale, filters, 6),
    getBlogTaxonomies(locale),
    hasFilters ? getBlogArticles(locale, {}, 3) : Promise.resolve(null),
    getSiteContent(locale),
  ]);
  const copy = blogCopy(locale);
  const listingCopy = blogListingCopy(locale);
  const latest = latestResult?.items ?? result?.items.slice(0, 3) ?? [];
  const filterPanel = (
    <BlogFilterPanel
      locale={locale}
      filters={filters}
      categories={options.categories}
      tags={options.tags}
      latest={latest}
    />
  );
  return (
    <main className="py-10 sm:py-14 lg:py-16">
      <SiteContainer>
        <div className="grid items-start gap-8 lg:min-h-[900px] lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <header className="mb-8 flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
              <div>
                <span className="text-xs font-black tracking-[0.18em] text-brand uppercase">
                  {listingCopy.eyebrow}
                </span>
                <h1 className="mt-3 text-3xl font-black text-content-strong sm:text-4xl">
                  {copy.blog}
                </h1>
                <p className="mt-3 text-sm leading-7 text-content-muted sm:text-base">
                  {copy.introduction}
                </p>
              </div>
              <BlogFilterDrawer
                key={`${filters.search ?? ""}:${filters.categoryId ?? ""}:${filters.tagId ?? ""}`}
                title={listingCopy.filters}
                closeLabel={listingCopy.closeFilters}
                activeCount={activeBlogFilterCount(filters)}
                isRtl={locale === "fa" || locale === "ar"}
              >
                {filterPanel}
              </BlogFilterDrawer>
            </header>
            {result?.items.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((article) => (
                  <BlogArticleCard key={article.id} article={article} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-line bg-surface px-6 py-20 text-center text-sm text-content-muted">
                {copy.empty}
              </div>
            )}
            {result && (
              <BlogListingPagination
                locale={locale}
                filters={filters}
                page={result.page}
                pageCount={Math.ceil(result.total / result.pageSize)}
              />
            )}
          </div>
          <aside className="sticky top-28 hidden max-h-[calc(100dvh-128px)] self-start overflow-y-auto overscroll-contain pe-1 lg:block">
            {filterPanel}
          </aside>
        </div>
        {siteContent?.blog?.banner && (
          <section className="mt-10 sm:mt-12">
            <ResponsiveBanner
              banner={siteContent.blog.banner}
              locale={locale}
              className="rounded-2xl border border-line sm:rounded-[20px]"
            />
          </section>
        )}
      </SiteContainer>
    </main>
  );
}
