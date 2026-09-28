import Link from "next/link";
import { blogCopy, type BlogFilters as Filters, type BlogTaxonomy } from "@/lib/blog";

type Props = { locale: string; filters: Filters; categories: BlogTaxonomy[]; tags: BlogTaxonomy[] };
export function BlogFilters({ locale, filters, categories, tags }: Props) {
  const copy = blogCopy(locale);
  return (
    <form className="catalog-filters" action={`/${locale}/blog`} method="get">
      <input
        aria-label={copy.search}
        name="search"
        maxLength={200}
        defaultValue={filters.search ?? ""}
        placeholder={copy.search}
      />
      <select
        aria-label={copy.categories}
        name="categoryId"
        defaultValue={filters.categoryId ?? ""}
      >
        <option value="">{copy.categories}</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      <select aria-label={copy.tags} name="tagId" defaultValue={filters.tagId ?? ""}>
        <option value="">{copy.tags}</option>
        {tags.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      <button type="submit">{copy.apply}</button>
      {(filters.search || filters.categoryId || filters.tagId) && (
        <Link className="button secondary" href={`/${locale}/blog`}>
          {copy.clear}
        </Link>
      )}
    </form>
  );
}
