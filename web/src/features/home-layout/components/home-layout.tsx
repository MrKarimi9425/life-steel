import type { ReactNode } from "react";
import type { ProductCardData, ProductFilters } from "@/lib/api";
import type { BlogCardData } from "@/lib/blog";
import type { HomeSection, HomeSectionType } from "@/lib/site-content";
import { HomeCategories } from "@/features/home-categories/components/home-categories";
import { HomeHero } from "@/features/home-hero/components/home-hero";
import { HomeFeaturedProduct } from "@/features/home-featured-product/components/home-featured-product";
import { HomeProducts } from "@/features/home-products/components/home-products";
import { HomeBannerSection } from "@/features/home-banners/components/home-banner-section";
import { HomeBenefits } from "@/features/home-benefits/components/home-benefits";
import { HomeContact } from "@/features/home-contact/components/home-contact";
import { HomeJournal } from "@/features/home-journal/components/home-journal";
import { HomeMotionProvider, Reveal } from "@/features/home-motion/components/home-motion";

const fallbackTypes: HomeSectionType[] = [
  "HERO",
  "CATEGORIES",
  "FEATURED_PRODUCT",
  "SELECTED_PRODUCTS",
  "BENEFITS",
  "BLOG",
  "CONTACT",
];

const fallbackSections = fallbackTypes.map((type, displayOrder) => ({
  id: `fallback-${type}`,
  type,
  displayOrder,
  banners: [],
}));

export function HomeLayout({
  locale,
  sections,
  categories,
  products,
  selectedProductsLimit,
  articles,
}: {
  locale: string;
  sections: HomeSection[] | null;
  categories: ProductFilters["categories"];
  products: ProductCardData[];
  selectedProductsLimit: number;
  articles: BlogCardData[];
}) {
  const orderedSections = [...(sections?.length ? sections : fallbackSections)].sort((a, b) => {
    if (a.type === "HERO") return -1;
    if (b.type === "HERO") return 1;
    return a.displayOrder - b.displayOrder;
  });
  const featured = products.find((product) => product.isFeatured) ?? products[0] ?? null;

  return (
    <HomeMotionProvider>
      <div className="flex flex-col gap-10 md:gap-12 lg:gap-16">
        {orderedSections.map((section) => {
          let content: ReactNode;

          switch (section.type) {
            case "HERO":
              content = <HomeHero locale={locale} banners={section.banners} />;
              break;
            case "CATEGORIES":
              content = (
                <HomeCategories locale={locale} categories={categories} products={products} />
              );
              break;
            case "FEATURED_PRODUCT":
              content = <HomeFeaturedProduct locale={locale} product={featured} />;
              break;
            case "SELECTED_PRODUCTS":
              content = (
                <HomeProducts locale={locale} products={products.slice(0, selectedProductsLimit)} />
              );
              break;
            case "BENEFITS":
              content = <HomeBenefits locale={locale} />;
              break;
            case "BLOG":
              content = <HomeJournal locale={locale} articles={articles} />;
              break;
            case "CONTACT":
              content = <HomeContact locale={locale} />;
              break;
            case "BANNER_FULL":
            case "BANNER_SPLIT":
              content = <HomeBannerSection section={section} locale={locale} />;
              break;
          }

          return (
            <Reveal key={section.id} direction={section.type === "HERO" ? "fade" : "up"}>
              {content}
            </Reveal>
          );
        })}
      </div>
    </HomeMotionProvider>
  );
}
