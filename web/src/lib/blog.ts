import { apiFetch } from "./api";

export type BlogMedia = {
  id: string;
  path: string | null;
  width: number | null;
  height: number | null;
  variants: Array<{ kind: string; path: string; width: number; height: number }>;
  translations: Array<{ title: string | null; altText: string | null; caption: string | null }>;
};
export type BlogCardData = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  publishedAt?: string | null;
  cover: BlogMedia | null;
};
export type BlogTaxonomy = { id: string; title: string; slug: string };
export type BlogNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: BlogNode[];
};
export type BlogArticle = Omit<BlogCardData, "cover"> & {
  content: BlogNode;
  seoTitle: string | null;
  seoDescription: string | null;
  coverMediaId: string | null;
  categories: Array<BlogTaxonomy & { isPrimary: boolean }>;
  tags: BlogTaxonomy[];
  media: BlogMedia[];
  related: BlogCardData[];
  translations: Array<{ language: string; slug: string; title: string }>;
};
export type BlogList = { items: BlogCardData[]; total: number; page: number; pageSize: number };
export type BlogFilters = { search?: string; categoryId?: string; tagId?: string; page?: string };

export async function getBlogArticles(locale: string, filters: BlogFilters = {}, pageSize = 12) {
  const query = new URLSearchParams({ language: locale, pageSize: String(pageSize), ...filters });
  return apiFetch<BlogList>(`public/blog?${query}`, true);
}
export function getBlogArticle(locale: string, slug: string) {
  return apiFetch<BlogArticle>(
    `public/blog/${encodeURIComponent(locale)}/${encodeURIComponent(slug)}`,
    true,
  );
}
export async function getBlogTaxonomies(locale: string) {
  const [categories, tags] = await Promise.all([
    apiFetch<BlogTaxonomy[]>(`public/blog/categories/${encodeURIComponent(locale)}`, true),
    apiFetch<BlogTaxonomy[]>(`public/blog/tags/${encodeURIComponent(locale)}`, true),
  ]);
  return { categories: categories ?? [], tags: tags ?? [] };
}

const labels = {
  fa: {
    blog: "وبلاگ",
    introduction: "مقاله ها و راهنماهای لایف استیل",
    search: "جستجوی مقاله",
    categories: "همه دسته بندی ها",
    tags: "همه برچسب ها",
    apply: "اعمال فیلتر",
    clear: "پاک کردن فیلترها",
    empty: "مقاله ای با این شرایط پیدا نشد.",
    read: "خواندن مقاله",
    back: "بازگشت به مقاله ها",
    gallery: "گالری مقاله",
    related: "مقاله های مرتبط",
    pages: "صفحه بندی مقاله ها",
    translations: "ترجمه های مقاله",
    error: "دریافت مقاله ها با خطا مواجه شد.",
    retry: "تلاش دوباره",
  },
  en: {
    blog: "Blog",
    introduction: "Life Steel articles and guides",
    search: "Search articles",
    categories: "All categories",
    tags: "All tags",
    apply: "Apply filters",
    clear: "Clear filters",
    empty: "No matching articles found.",
    read: "Read article",
    back: "Back to articles",
    gallery: "Article gallery",
    related: "Related articles",
    pages: "Article pages",
    translations: "Article translations",
    error: "Unable to load articles.",
    retry: "Try again",
  },
  ar: {
    blog: "المدونة",
    introduction: "مقالات وأدلة لايف ستيل",
    search: "البحث عن مقال",
    categories: "جميع الفئات",
    tags: "جميع الوسوم",
    apply: "تطبيق الفلاتر",
    clear: "مسح الفلاتر",
    empty: "لا توجد مقالات مطابقة.",
    read: "قراءة المقال",
    back: "العودة إلى المقالات",
    gallery: "معرض صور المقال",
    related: "مقالات ذات صلة",
    pages: "صفحات المقالات",
    translations: "ترجمات المقال",
    error: "تعذر تحميل المقالات.",
    retry: "إعادة المحاولة",
  },
};
export function blogCopy(locale: string) {
  return labels[locale as keyof typeof labels] ?? labels.en;
}
