import type { Metadata } from "next";
import { getLanguages } from "@/lib/api";
import { listingQuery, pageSeo } from "@/lib/page-seo";
import { BlogCard } from "@/components/blog-card";
import { BlogFilters } from "@/components/blog-filters";
import { BlogPagination } from "@/components/blog-pagination";
import {
  blogCopy,
  getBlogArticles,
  getBlogTaxonomies,
  type BlogFilters as Filters,
} from "@/lib/blog";

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
  const [result, options] = await Promise.all([
    getBlogArticles(locale, filters),
    getBlogTaxonomies(locale),
  ]);
  const copy = blogCopy(locale);
  return (
    <main className="section listing-page">
      <div className="listing-hero">
        <span className="eyebrow">LIFE STEEL JOURNAL</span>
        <h1>{copy.blog}</h1>
        <p>{copy.introduction}</p>
      </div>
      <BlogFilters
        locale={locale}
        filters={filters}
        categories={options.categories}
        tags={options.tags}
      />
      {result?.items.length ? (
        <div className="product-grid">
          {result.items.map((article) => (
            <BlogCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty-state">{copy.empty}</div>
      )}
      {result && (
        <BlogPagination
          locale={locale}
          filters={filters}
          page={result.page}
          pageCount={Math.ceil(result.total / result.pageSize)}
        />
      )}
    </main>
  );
}
