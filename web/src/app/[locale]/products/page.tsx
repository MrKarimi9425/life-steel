import type { Metadata } from "next";
import { getLanguages, getProductFilters, getProducts } from "@/lib/api";
import { listingQuery, pageSeo } from "@/lib/page-seo";
import { getSiteContent } from "@/lib/site-content";
import { ProductCatalogPage } from "@/features/product-catalog/components/product-catalog-page";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
const supportedFilters = [
  "search",
  "categoryId",
  "attributeId",
  "optionId",
  "minNumber",
  "maxNumber",
  "booleanValue",
  "attributeFilters",
  "minPrice",
  "maxPrice",
  "sort",
  "page",
];

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const languages = await getLanguages();
  const query = listingQuery(await searchParams, supportedFilters);
  return pageSeo({
    path: `/${locale}/products${query}`,
    title: locale === "fa" ? "محصولات" : "Products",
    description:
      locale === "fa"
        ? "مجموعه حوله خشک کن ها و رادیاتورهای استیل لایف استیل"
        : "Life Steel towel warmers and stainless steel radiators",
    languagePaths: Object.fromEntries(
      languages.map((language) => [language.code, `/${language.code}/products${query}`]),
    ),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const incoming = await searchParams;
  const filters: Record<string, string | string[]> = {};
  for (const key of supportedFilters) {
    const value = incoming[key];
    if (Array.isArray(value)) {
      const values = value.filter(Boolean);
      if (values.length) filters[key] = values;
    } else if (typeof value === "string" && value) filters[key] = value;
  }
  const [result, options, siteContent] = await Promise.all([
    getProducts(locale, filters),
    getProductFilters(locale),
    getSiteContent(locale),
  ]);
  return (
    <ProductCatalogPage
      locale={locale}
      filters={filters}
      options={options}
      result={result}
      banner={siteContent?.products.banner ?? null}
    />
  );
}
