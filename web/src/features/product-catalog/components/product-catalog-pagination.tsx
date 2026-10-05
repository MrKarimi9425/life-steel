import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { productCatalogCopy } from "../product-catalog.copy";
import { catalogHref, type ProductCatalogQuery } from "../lib/catalog-query";

export function ProductCatalogPagination({
  locale,
  filters,
  page,
  pageCount,
}: {
  locale: string;
  filters: ProductCatalogQuery;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const copy = productCatalogCopy(locale);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
  );
  const isRtl = locale === "fa" || locale === "ar";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label={copy.pages}>
      {page > 1 && (
        <Link
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-content-muted transition-colors hover:bg-surface-muted hover:text-content-strong"
          href={catalogHref(locale, filters, { page: String(page - 1) })}
        >
          {isRtl ? <FiChevronRight /> : <FiChevronLeft />}
        </Link>
      )}
      {pages.map((item, index) => (
        <span className="contents" key={item}>
          {index > 0 && item - pages[index - 1]! > 1 && (
            <span className="px-1 text-content-subtle">…</span>
          )}
          <Link
            className={`grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-extrabold transition-colors ${
              item === page
                ? "bg-brand text-content-on-brand"
                : "border border-line text-content-muted hover:bg-surface-muted"
            }`}
            href={catalogHref(locale, filters, { page: String(item) })}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link
          className="grid h-10 w-10 place-items-center rounded-xl border border-line text-content-muted transition-colors hover:bg-surface-muted hover:text-content-strong"
          href={catalogHref(locale, filters, { page: String(page + 1) })}
        >
          {isRtl ? <FiChevronLeft /> : <FiChevronRight />}
        </Link>
      )}
    </nav>
  );
}
