import Link from "next/link";
import { ProductFilterDrawer } from "./product-filter-drawer";
import { productCatalogCopy } from "../product-catalog.copy";
import { catalogHref, queryValue, type ProductCatalogQuery } from "../lib/catalog-query";

export function ProductCatalogToolbar({
  locale,
  filters,
  total,
  activeFilterCount,
  mobileFilters,
}: {
  locale: string;
  filters: ProductCatalogQuery;
  total: number;
  activeFilterCount: number;
  mobileFilters: React.ReactNode;
}) {
  const copy = productCatalogCopy(locale);
  const sorting = [
    { value: null, label: copy.defaultSort },
    { value: "newest", label: copy.newest },
    { value: "oldest", label: copy.oldest },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div className="flex items-center gap-3">
        <ProductFilterDrawer
          title={copy.filters}
          closeLabel={copy.close}
          activeCount={activeFilterCount}
          isRtl={locale === "fa" || locale === "ar"}
        >
          {mobileFilters}
        </ProductFilterDrawer>
        <p className="text-sm text-content-muted">
          <strong className="font-extrabold text-content-strong">{total}</strong> {copy.results}
        </p>
      </div>
      <div
        className="flex items-center gap-1 rounded-xl bg-surface-muted p-1"
        aria-label={copy.sort}
      >
        {sorting.map((item) => {
          const active = queryValue(filters, "sort") === (item.value ?? "");
          return (
            <Link
              key={item.label}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                active
                  ? "bg-surface text-content-strong"
                  : "text-content-muted hover:text-content-strong"
              }`}
              href={catalogHref(locale, filters, { sort: item.value, page: null })}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
