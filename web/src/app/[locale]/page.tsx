import { getLanguages, getProductFilters, getProducts } from "@/lib/api";
import { getBlogArticles } from "@/lib/blog";
import { getSiteContent } from "@/lib/site-content";
import { pageSeo } from "@/lib/page-seo";
import {
  HomeHero,
  HomeCategories,
  HomeBenefits,
  HomeProducts,
  HomeFeatured,
  HomeStories,
  HomeJournal,
  HomeContact,
} from "@/components/home-sections";
import "@/app/home.css";

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
    getProducts(locale, { pageSize: "6" }),
    getProductFilters(locale),
    getBlogArticles(locale, {}, 4).catch(() => null),
    getSiteContent(locale).catch(() => null),
  ]);
  return (
    <main className="home-page">
      <HomeCategories
        locale={locale}
        categories={filters.categories}
        products={productList.items}
      />
      <HomeHero
        locale={locale}
        featured={productList.items.find((product) => product.isFeatured) ?? null}
      />
      <HomeProducts locale={locale} products={productList.items} />
      <HomeFeatured
        locale={locale}
        product={
          productList.items.find((product) => product.isFeatured) ?? productList.items[0] ?? null
        }
      />
      <HomeStories
        locale={locale}
        aboutTitle={content?.about?.title ?? null}
        products={productList.items}
      />
      <HomeBenefits locale={locale} />
      <HomeJournal locale={locale} articles={articleList?.items ?? []} />
      <HomeContact locale={locale} />
    </main>
  );
}
