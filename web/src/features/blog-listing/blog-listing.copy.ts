const labels = {
  fa: {
    eyebrow: "مجله لایف استیل",
    filters: "فیلتر مقاله ها",
    closeFilters: "بستن فیلترها",
    search: "جستجو در مقالات",
    searchButton: "جستجو",
    categories: "دسته بندی ها",
    tags: "برچسب ها",
    latest: "آخرین مقالات",
    all: "همه مقالات",
    article: "مقاله",
  },
  en: {
    eyebrow: "Life Steel journal",
    filters: "Filter articles",
    closeFilters: "Close filters",
    search: "Search articles",
    searchButton: "Search",
    categories: "Categories",
    tags: "Tags",
    latest: "Latest articles",
    all: "All articles",
    article: "Article",
  },
  ar: {
    eyebrow: "مجلة لايف ستيل",
    filters: "تصفية المقالات",
    closeFilters: "إغلاق عوامل التصفية",
    search: "البحث في المقالات",
    searchButton: "بحث",
    categories: "الفئات",
    tags: "الوسوم",
    latest: "أحدث المقالات",
    all: "كل المقالات",
    article: "مقال",
  },
} as const;

export function blogListingCopy(locale: string) {
  return labels[locale as keyof typeof labels] ?? labels.en;
}
