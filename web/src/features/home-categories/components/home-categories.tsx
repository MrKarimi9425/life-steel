import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import { homeSectionTitleClass } from "@/features/home-layout/home-layout.styles";
import { RevealGroup, RevealItem } from "@/features/home-motion/components/home-motion";
import { mediaUrl, type ProductCardData, type ProductFilters } from "@/lib/api";

type HomeCategoriesProps = {
  locale: string;
  categories: ProductFilters["categories"];
  products: ProductCardData[];
};

function categoryImage(
  category: ProductFilters["categories"][number],
  products: ProductCardData[],
) {
  if (category.image?.kind === "IMAGE") {
    const ownImage = mediaUrl(category.image.path);
    if (ownImage) return ownImage;
  }

  const product = products.find(
    (item) =>
      item.coverMedia?.kind === "IMAGE" &&
      item.categories.some((entry) =>
        entry.category.translations.some(
          (translation) => translation.slug === category.translations[0]?.slug,
        ),
      ),
  );
  return mediaUrl(product?.coverMedia?.path ?? null);
}

export function HomeCategories({ locale, categories, products }: HomeCategoriesProps) {
  if (!categories.length) return null;

  const label = locale === "fa" ? "محصولات" : locale === "ar" ? "المنتجات" : "Products";
  const title =
    locale === "fa"
      ? "دسته بندی محصولات"
      : locale === "ar"
        ? "فئات المنتجات"
        : "Product categories";
  const DirectionArrow = locale === "en" ? FiArrowRight : FiArrowLeft;

  return (
    <SiteContainer as="section" aria-labelledby="home-categories-title">
      <h2
        id="home-categories-title"
        className={`mb-5 text-content-strong sm:mb-6 ${homeSectionTitleClass}`}
      >
        {title}
      </h2>
      <div className="overflow-x-visible overflow-y-hidden py-2 [scrollbar-width:none] min-[761px]:overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <nav aria-label={label}>
          <RevealGroup className="grid w-full grid-cols-2 items-start gap-5 px-1 min-[761px]:flex min-[761px]:w-max min-[761px]:min-w-full min-[761px]:justify-center min-[761px]:gap-8">
            {categories.map((category) => {
              const translation = category.translations[0];
              if (!translation) return null;

              const image = categoryImage(category, products);
              return (
                <RevealItem className="w-full shrink-0 min-[761px]:w-40" key={category.id}>
                  <Link
                    className="group flex w-full flex-col items-center gap-3 text-center transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus motion-reduce:transform-none motion-reduce:transition-none"
                    href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                  >
                    <span className="relative grid size-36 place-items-center rounded-full border-2 border-brand bg-surface p-1.5 max-[760px]:size-[118px]">
                      <span className="relative grid size-full place-items-center overflow-hidden rounded-full border border-line bg-surface-muted">
                        {image ? (
                          <Image
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transform-none motion-reduce:transition-none"
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 760px) 106px, 132px"
                          />
                        ) : (
                          <>
                            <span
                              className="absolute -top-10 -end-8 size-28 rounded-full border-[18px] border-brand/10"
                              aria-hidden="true"
                            />
                            <span className="relative font-[Arial,sans-serif] text-3xl font-black text-brand-strong">
                              LS
                            </span>
                          </>
                        )}
                      </span>
                      <span className="absolute end-0 bottom-1 grid size-9 place-items-center rounded-full border-[3px] border-surface bg-brand text-content-inverse transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none max-[760px]:size-8">
                        <DirectionArrow className="size-4" aria-hidden="true" />
                      </span>
                    </span>
                    <span className="line-clamp-2 min-h-12 max-w-full text-[15px] leading-6 font-black text-content-strong transition-colors duration-300 group-hover:text-brand-strong max-[760px]:text-sm">
                      {translation.title}
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </nav>
      </div>
    </SiteContainer>
  );
}
