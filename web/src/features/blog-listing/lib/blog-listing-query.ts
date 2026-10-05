import type { BlogFilters } from "@/lib/blog";

export function blogListingHref(
  locale: string,
  current: BlogFilters,
  patch: Partial<Record<keyof BlogFilters, string | null>> = {},
) {
  const query = new URLSearchParams();
  const merged = { ...current, ...patch };
  for (const key of ["search", "categoryId", "tagId", "page"] as const) {
    const value = merged[key];
    if (value && !(key === "page" && value === "1")) query.set(key, value);
  }
  const search = query.toString();
  return `/${locale}/blog${search ? `?${search}` : ""}`;
}

export function activeBlogFilterCount(filters: BlogFilters) {
  return [filters.search, filters.categoryId, filters.tagId].filter(Boolean).length;
}
