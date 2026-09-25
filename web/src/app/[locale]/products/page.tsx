import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProductFilters, getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
const supportedFilters = [
  "search", "categoryId", "attributeId", "optionId", "minNumber", "maxNumber",
  "booleanValue", "sort", "page",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "fa" ? "محصولات" : "Products" };
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
  const filters = Object.fromEntries(
    supportedFilters.flatMap((key) => {
      const value = incoming[key];
      return typeof value === "string" && value ? [[key, value]] : [];
    }),
  );
  const [result, options] = await Promise.all([
    getProducts(locale, filters),
    getProductFilters(locale),
  ]);
  const isFa = locale === "fa";
  const selectedAttribute = options.attributes.find((item) => item.id === filters.attributeId);
  const pageCount = Math.ceil(result.total / result.pageSize);
  const pageHref = (page: number) => {
    const query = new URLSearchParams({ ...filters, page: String(page) });
    return `/${locale}/products?${query.toString()}`;
  };

  return (
    <main className="section listing-page">
      <div className="listing-hero">
        <span className="eyebrow">LIFE STEEL COLLECTION</span>
        <h1>{isFa ? "محصولات استیل" : "Stainless steel products"}</h1>
        <p>{isFa ? "مجموعه حوله خشک کن ها و رادیاتورهای استیل لایف استیل" : "Life Steel towel warmers and stainless steel radiators"}</p>
      </div>
      <form className="catalog-filters" action={`/${locale}/products`} method="get">
        <input name="search" defaultValue={filters.search ?? ""} placeholder={isFa ? "جستجوی محصول" : "Search products"} />
        <select name="categoryId" defaultValue={filters.categoryId ?? ""}>
          <option value="">{isFa ? "همه دسته بندی ها" : "All categories"}</option>
          {options.categories.map((category) => (
            <option key={category.id} value={category.id}>{category.translations[0]?.title}</option>
          ))}
        </select>
        <select name="attributeId" defaultValue={filters.attributeId ?? ""}>
          <option value="">{isFa ? "همه ویژگی ها" : "All attributes"}</option>
          {options.attributes.map((attribute) => (
            <option key={attribute.id} value={attribute.id}>{attribute.translations[0]?.name}</option>
          ))}
        </select>
        {selectedAttribute && ["SINGLE_SELECT", "MULTI_SELECT", "COLOR"].includes(selectedAttribute.type) && (
          <select name="optionId" defaultValue={filters.optionId ?? ""}>
            <option value="">{isFa ? "همه گزینه ها" : "All options"}</option>
            {selectedAttribute.options.map((option) => (
              <option key={option.id} value={option.id}>{option.translations[0]?.label}</option>
            ))}
          </select>
        )}
        {selectedAttribute?.type === "NUMBER" && (
          <>
            <input name="minNumber" type="number" defaultValue={filters.minNumber ?? ""} placeholder={isFa ? "حداقل" : "Min"} />
            <input name="maxNumber" type="number" defaultValue={filters.maxNumber ?? ""} placeholder={isFa ? "حداکثر" : "Max"} />
          </>
        )}
        {selectedAttribute?.type === "BOOLEAN" && (
          <select name="booleanValue" defaultValue={filters.booleanValue ?? ""}>
            <option value="">{isFa ? "همه" : "All"}</option>
            <option value="true">{isFa ? "بله" : "Yes"}</option>
            <option value="false">{isFa ? "خیر" : "No"}</option>
          </select>
        )}
        <select name="sort" defaultValue={filters.sort ?? ""}>
          <option value="">{isFa ? "ترتیب پیش فرض" : "Default order"}</option>
          <option value="newest">{isFa ? "جدیدترین" : "Newest"}</option>
          <option value="oldest">{isFa ? "قدیمی ترین" : "Oldest"}</option>
        </select>
        <button type="submit">{isFa ? "اعمال فیلتر" : "Apply filters"}</button>
      </form>
      {result.items.length > 0 ? (
        <div className="product-grid">
          {result.items.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
        </div>
      ) : (
        <div className="empty-state">{isFa ? "محصولی با این شرایط پیدا نشد." : "No matching products found."}</div>
      )}
      {pageCount > 1 && (
        <nav className="pagination" aria-label={isFa ? "صفحه بندی محصولات" : "Product pages"}>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <Link key={page} href={pageHref(page)} className={page === result.page ? "active" : ""}>{page}</Link>
          ))}
        </nav>
      )}
    </main>
  );
}
