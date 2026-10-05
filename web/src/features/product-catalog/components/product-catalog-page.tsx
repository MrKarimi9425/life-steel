import { FiPackage } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import type { ProductFilters, ProductList } from "@/lib/api";
import type { SiteBanner } from "@/lib/site-content";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductCatalogBanner } from "./product-catalog-banner";
import { ProductCatalogPagination } from "./product-catalog-pagination";
import { ProductCatalogToolbar } from "./product-catalog-toolbar";
import { ProductFilterFields } from "./product-filter-fields";
import { productCatalogCopy } from "../product-catalog.copy";
import { selectedAttributeCount } from "../lib/attribute-filter-query";
import { queryValues, type ProductCatalogQuery } from "../lib/catalog-query";

const filterKeys = ["search", "categoryId", "minPrice", "maxPrice"];

export function ProductCatalogPage({
  locale,
  filters,
  options,
  result,
  banner,
}: {
  locale: string;
  filters: ProductCatalogQuery;
  options: ProductFilters;
  result: ProductList;
  banner: SiteBanner | null;
}) {
  const copy = productCatalogCopy(locale);
  const activeFilterCount =
    filterKeys.filter((key) => queryValues(filters, key).length > 0).length +
    selectedAttributeCount(filters);
  const pageCount = Math.ceil(result.total / result.pageSize);
  const filterStateKey = JSON.stringify(filters);

  return (
    <main className="min-h-[70vh] pb-20 pt-8 sm:pt-10">
      <SiteContainer as="section" className="mb-6">
        <span className="text-[11px] font-black tracking-[0.18em] text-brand">{copy.eyebrow}</span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[PeydaHeader] text-3xl font-black text-content-strong sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-7 text-content-muted sm:text-base">
              {copy.description}
            </p>
          </div>
        </div>
      </SiteContainer>
      {banner && <ProductCatalogBanner banner={banner} locale={locale} />}
      <SiteContainer className={banner ? "mt-8" : "mt-2"}>
        <div className="grid items-start gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="sticky top-28 hidden rounded-2xl border border-line bg-surface p-5 lg:block">
            <h2 className="mb-5 text-lg font-extrabold text-content-strong">{copy.filters}</h2>
            <ProductFilterFields
              key={`desktop-${filterStateKey}`}
              locale={locale}
              filters={filters}
              options={options}
            />
          </aside>
          <section className="min-w-0">
            <ProductCatalogToolbar
              locale={locale}
              filters={filters}
              total={result.total}
              activeFilterCount={activeFilterCount}
              mobileFilters={
                <ProductFilterFields
                  key={`mobile-${filterStateKey}`}
                  locale={locale}
                  filters={filters}
                  options={options}
                />
              }
            />
            {result.items.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-line p-8 text-center text-content-muted">
                <FiPackage className="mb-4 text-brand" size={34} />
                <p>{copy.empty}</p>
              </div>
            )}
            <ProductCatalogPagination
              locale={locale}
              filters={filters}
              page={result.page}
              pageCount={pageCount}
            />
          </section>
        </div>
      </SiteContainer>
    </main>
  );
}
