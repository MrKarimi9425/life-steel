export type ProductCatalogQuery = Record<string, string | string[]>;

export function queryValues(filters: ProductCatalogQuery, key: string): string[] {
  const value = filters[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function queryValue(filters: ProductCatalogQuery, key: string): string {
  return queryValues(filters, key)[0] ?? "";
}

export function catalogHref(
  locale: string,
  filters: ProductCatalogQuery,
  changes: Record<string, string | null>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  const value = query.toString();
  return `/${locale}/products${value ? `?${value}` : ""}`;
}
