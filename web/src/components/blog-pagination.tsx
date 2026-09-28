import Link from "next/link";
import { blogCopy, type BlogFilters } from "@/lib/blog";

export function BlogPagination({
  locale,
  filters,
  page,
  pageCount,
}: {
  locale: string;
  filters: BlogFilters;
  page: number;
  pageCount: number;
}) {
  if (pageCount < 2) return null;
  const pages = [
    ...new Set([1, ...Array.from({ length: 5 }, (_, index) => page - 2 + index), pageCount]),
  ]
    .filter((item) => item > 0 && item <= pageCount)
    .sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label={blogCopy(locale).pages}>
      {pages.map((number, index) => (
        <span key={number} className="pagination-item">
          {index > 0 && number - pages[index - 1]! > 1 && <span aria-hidden>…</span>}
          <Link
            aria-current={number === page ? "page" : undefined}
            className={number === page ? "active" : ""}
            href={`/${locale}/blog?${new URLSearchParams({ ...filters, page: String(number) })}`}
          >
            {number}
          </Link>
        </span>
      ))}
    </nav>
  );
}
