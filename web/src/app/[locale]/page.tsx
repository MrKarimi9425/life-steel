import { getLanguages, getProductFilters, getProducts } from "@/lib/api";
import { getBlogArticles } from "@/lib/blog";
import { getSiteContent } from "@/lib/site-content";
import { pageSeo } from "@/lib/page-seo";
import { HomeLayout } from "@/features/home-layout/components/home-layout";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const languages = await getLanguages();
  const isFa = locale === "fa";
  return pageSeo({
    path: `/${locale}`,
    title: isFa ? "حوله خشک کن و رادیاتور استیل" : "Stainless steel radiators and towel warmers",
    description: isFa
      ? "تولید تخصصی حوله خشک کن و رادیاتور استیل لایف استیل"
      : "Life Steel stainless steel radiators and towel warmers.",
    languagePaths: Object.fromEntries(
      languages.map((language) => [language.code, `/${language.code}`]),
    ),
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [productList, filters, articleList, content] = await Promise.all([
    getProducts(locale, { pageSize: "8" }),
    getProductFilters(locale),
    getBlogArticles(locale, {}, 5).catch(() => null),
    getSiteContent(locale).catch(() => null),
  ]);
  return (
    <main className="bg-surface pt-5 pb-[35px] text-content-strong max-[680px]:pt-0">
      <HomeLayout
        locale={locale}
        sections={content?.homePage.sections ?? null}
        categories={filters.categories}
        products={productList.items}
        selectedProductsLimit={content?.homePage.selectedProductsLimit ?? 6}
        articles={articleList?.items ?? []}
      />
    </main>
  );
}
