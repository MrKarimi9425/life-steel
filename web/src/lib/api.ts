export type Language = {
  code: string;
  name: string;
  nativeName: string;
  direction: "RTL" | "LTR";
  isDefault: boolean;
};

export type Media = {
  path: string | null;
  externalUrl: string | null;
  kind: "IMAGE" | "VIDEO";
  translations: Array<{ title: string | null; altText: string | null }>;
  variants: Array<{ kind: string; path: string; width: number; height: number }>;
};

export type ProductCardData = {
  id: string;
  sku: string | null;
  isFeatured: boolean;
  translations: Array<{ title: string; slug: string; summary: string | null }>;
  coverMedia: Media | null;
  categories: Array<{
    isPrimary: boolean;
    category: { translations: Array<{ title: string; slug: string }> };
  }>;
};

export type ProductDetailData = Omit<ProductCardData, "translations"> & {
  relatedProducts: ProductCardData[];
  translations: Array<{
    title: string;
    slug: string;
    summary: string | null;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  media: Array<{ media: Media }>;
  attributeValues: Array<{
    numberValue: string | null;
    booleanValue: boolean | null;
    rawValue: unknown;
    translations: Array<{ textValue: string }>;
    attribute: {
      translations: Array<{ name: string; unitLabel: string | null }>;
    };
    selectedOptions: Array<{
      option: { translations: Array<{ label: string }> };
    }>;
  }>;
};

type ApiResponse<T> = { data: T | null };
const backend = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3000";

export async function apiFetch<T>(path: string, strict = false): Promise<T | null> {
  try {
    const response = await fetch(`${backend}/api/v1/${path}`, { cache: "no-store" });
    if (!response.ok) {
      if (strict && response.status !== 404) throw new Error("Public API request failed.");
      return null;
    }
    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } catch (error) {
    if (strict) throw error;
    return null;
  }
}

export async function getLanguages(): Promise<Language[]> {
  return (
    (await apiFetch<Language[]>("public/languages")) ?? [
      { code: "fa", name: "فارسی", nativeName: "فارسی", direction: "RTL", isDefault: true },
      { code: "en", name: "انگلیسی", nativeName: "English", direction: "LTR", isDefault: false },
    ]
  );
}

export async function getPhrases(locale: string): Promise<Record<string, string>> {
  return (await apiFetch<Record<string, string>>(`public/languages/${locale}/interface-phrases`)) ?? {};
}

export type ProductList = {
  items: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductFilters = {
  categories: Array<{ id: string; translations: Array<{ title: string; slug: string }> }>;
  attributes: Array<{
    id: string;
    type: string;
    translations: Array<{ name: string; unitLabel: string | null }>;
    options: Array<{ id: string; translations: Array<{ label: string }> }>;
  }>;
};

export async function getProducts(
  locale: string,
  filters: Record<string, string> = {},
): Promise<ProductList> {
  const params = new URLSearchParams({ language: locale, pageSize: "12", ...filters });
  return (await apiFetch<ProductList>(`public/products?${params.toString()}`)) ?? {
    items: [], total: 0, page: 1, pageSize: 12,
  };
}

export async function getProductFilters(locale: string): Promise<ProductFilters> {
  const [categories, attributes] = await Promise.all([
    apiFetch<ProductFilters["categories"]>(`public/products/categories/${encodeURIComponent(locale)}`),
    apiFetch<ProductFilters["attributes"]>(`public/products/filters/${encodeURIComponent(locale)}`),
  ]);
  return { categories: categories ?? [], attributes: attributes ?? [] };
}

export function getProduct(locale: string, slug: string): Promise<ProductDetailData | null> {
  return apiFetch<ProductDetailData>(
    `public/products/${encodeURIComponent(locale)}/${encodeURIComponent(slug)}`,
  );
}

export function mediaUrl(path: string | null): string | null {
  return path ? `/api/public/media/${path}` : null;
}
