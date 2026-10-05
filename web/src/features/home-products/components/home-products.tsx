"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FiArrowLeft, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { ProductPriceText } from "@/components/product-price-text";
import { SiteContainer } from "@/components/site-container";
import { homeSectionTitleClass } from "@/features/home-layout/home-layout.styles";
import { ProductRail } from "@/features/home-visual/components/product-rail";
import { useReducedMotion } from "@/features/home-products/hooks/use-reduced-motion";
import { mediaUrl, type ProductCardData } from "@/lib/api";

const copy = {
  fa: {
    title: "برای هر فضا، یک انتخاب",
    subtitle: "مدل های منتخب لایف استیل",
    all: "همه محصولات",
    detail: "مشاهده مدل",
    empty: "محصولات پس از انتشار در پنل، اینجا نمایش داده میشوند.",
  },
  en: {
    title: "A choice for every space",
    subtitle: "Selected Life Steel models",
    all: "All products",
    detail: "View model",
    empty: "Published products will appear here.",
  },
  ar: {
    title: "اختيار لكل مساحة",
    subtitle: "منتجات مختارة من لايف ستيل",
    all: "كل المنتجات",
    detail: "عرض المنتج",
    empty: "ستظهر المنتجات هنا بعد نشرها.",
  },
} as const;

const localizedCopy = (locale: string) => copy[locale as keyof typeof copy] ?? copy.en;

export function HomeProducts({
  locale,
  products,
}: {
  locale: string;
  products: ProductCardData[];
}) {
  const labels = localizedCopy(locale);
  const DirectionArrow = locale === "en" ? FiArrowRight : FiArrowLeft;
  const swiper = useRef<SwiperInstance | null>(null);
  const reducedMotion = useReducedMotion();
  const canNavigate = products.length > 3;

  return (
    <SiteContainer as="section">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <span className="text-xs font-black tracking-[.14em] text-brand-strong">LIFE STEEL</span>
          <h2 className={`mt-1 text-content-strong ${homeSectionTitleClass}`}>{labels.title}</h2>
          <p className="mt-1 text-sm font-medium text-content-muted">{labels.subtitle}</p>
        </div>
        {canNavigate && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => swiper.current?.slidePrev()}
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-content transition-colors hover:border-brand hover:bg-brand hover:text-content-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label="Previous products"
            >
              <FiChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => swiper.current?.slideNext()}
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-content transition-colors hover:border-brand hover:bg-brand hover:text-content-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label="Next products"
            >
              <FiChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 rounded-[32px] border border-line bg-surface-muted p-3.5 sm:p-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:p-6">
        <div className="relative flex min-h-48 flex-col justify-end overflow-hidden rounded-[24px] bg-brand p-6 text-content-on-brand lg:min-h-[410px]">
          <span
            className="absolute -top-16 -left-16 h-52 w-52 rounded-full border-[32px] border-surface-soft"
            aria-hidden="true"
          />
          <span
            className="absolute -right-12 -bottom-20 h-48 w-48 rounded-full border-[26px] border-content-inverse/10"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <span className="text-xs font-black tracking-[.16em]">SELECTED COLLECTION</span>
            <p className="mt-3 max-w-48 text-lg leading-8 font-black">{labels.subtitle}</p>
            <Link
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-black text-content-strong transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand motion-reduce:transition-none"
              href={`/${locale}/products`}
            >
              {labels.all}
              <DirectionArrow className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {products.length ? (
          <div className="min-w-0 overflow-hidden">
            <Swiper
              className="w-full!"
              modules={[A11y, Autoplay]}
              slidesPerView="auto"
              spaceBetween={14}
              loop={canNavigate}
              watchOverflow
              grabCursor={products.length > 1}
              speed={650}
              autoplay={
                products.length > 1 && !reducedMotion
                  ? {
                      delay: 4000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              onSwiper={(instance) => {
                swiper.current = instance;
              }}
            >
              {products.map((product) => {
                const translation = product.translations[0];
                if (!translation) return null;
                const src = mediaUrl(product.coverMedia?.path ?? null);
                const category = product.categories.find((entry) => entry.isPrimary)?.category
                  .translations[0]?.title;

                return (
                  <SwiperSlide
                    className="!h-auto !w-[87%] sm:!w-[calc((100%_-_14px)/2)] lg:!w-[calc((100%_-_28px)/3)]"
                    key={product.id}
                  >
                    <Link
                      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-line bg-surface p-2.5 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                      href={`/${locale}/products/${encodeURIComponent(translation.slug)}`}
                    >
                      <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-[16px] bg-surface-muted sm:h-[255px] xl:h-[clamp(250px,22vw,315px)]">
                        {src ? (
                          <Image
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
                            src={src}
                            alt={product.coverMedia?.translations[0]?.altText ?? translation.title}
                            fill
                            sizes="(max-width: 680px) 87vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="scale-90">
                            <ProductRail black={product.id.charCodeAt(0) % 2 === 0} />
                          </div>
                        )}
                        {category && (
                          <span className="absolute top-3 start-3 rounded-lg border border-line bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-content backdrop-blur-sm">
                            {category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                        <h3 className="line-clamp-2 text-[17px] leading-7 font-black text-content-strong">
                          {translation.title}
                        </h3>
                        {translation.summary && (
                          <p className="mt-1 line-clamp-2 text-xs leading-6 font-medium text-content-muted">
                            {translation.summary}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-line pt-3 text-xs">
                          {product.pricing ? (
                            <ProductPriceText pricing={product.pricing} locale={locale} />
                          ) : (
                            <span />
                          )}
                          <strong className="inline-flex items-center gap-1.5 text-brand-strong">
                            {labels.detail}
                            <DirectionArrow
                              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1 ltr:group-hover:translate-x-1 motion-reduce:transition-none"
                              aria-hidden="true"
                            />
                          </strong>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : (
          <p className="grid min-h-52 place-items-center rounded-[20px] bg-surface p-8 text-center text-content-muted">
            {labels.empty}
          </p>
        )}
      </div>
    </SiteContainer>
  );
}
