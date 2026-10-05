"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import type { SiteBanner } from "@/lib/site-content";
import { ResponsiveBanner } from "@/features/home-banners/components/responsive-banner";

type Props = {
  locale: string;
  banners: SiteBanner[];
};

const AUTOPLAY_DELAY_MS = 4000;

const labels = {
  fa: { previous: "بنر قبلی", next: "بنر بعدی", slide: "نمایش بنر" },
  ar: { previous: "البنر السابق", next: "البنر التالي", slide: "عرض البنر" },
  en: { previous: "Previous banner", next: "Next banner", slide: "Show banner" },
} as const;

export function HomeHero({ locale, banners }: Props) {
  const copy = labels[locale as keyof typeof labels] ?? labels.en;
  const isRtl = locale === "fa" || locale === "ar";
  const swiper = useRef<SwiperInstance | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  if (!banners.length) return null;

  const hasMultipleSlides = banners.length > 1;
  const resumeAutoplay = () => {
    if (!prefersReducedMotion && hasMultipleSlides) swiper.current?.autoplay.start();
  };

  return (
    <section
      className="relative overflow-hidden bg-surface-soft"
      aria-roledescription={hasMultipleSlides ? "carousel" : undefined}
      aria-label={
        locale === "fa"
          ? "بنرهای صفحه اصلی"
          : locale === "ar"
            ? "بنرات الصفحة الرئيسية"
            : "Homepage banners"
      }
      onFocusCapture={() => swiper.current?.autoplay.stop()}
      onBlurCapture={resumeAutoplay}
    >
      <Swiper
        className="w-full"
        autoHeight
        dir={isRtl ? "rtl" : "ltr"}
        modules={[A11y, Autoplay]}
        rewind={hasMultipleSlides}
        speed={450}
        autoplay={
          hasMultipleSlides && !prefersReducedMotion
            ? {
                delay: AUTOPLAY_DELAY_MS,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        onSlideChange={(instance) => setCurrentIndex(instance.realIndex)}
        onSwiper={(instance) => {
          swiper.current = instance;
        }}
      >
        {banners.map((banner, position) => (
          <SwiperSlide key={banner.id} className="!h-auto">
            <ResponsiveBanner
              className="w-full focus-visible:outline-offset-[-3px]"
              banner={banner}
              locale={locale}
              priority={position === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {hasMultipleSlides && (
        <>
          <div
            className={`absolute bottom-4 left-4 z-10 flex gap-2 max-[680px]:bottom-2 max-[680px]:left-2 ${isRtl ? "flex-row-reverse" : ""}`}
            dir="ltr"
          >
            <button
              className="grid h-9 w-9 place-items-center rounded-lg bg-surface-dark/75 text-content-inverse backdrop-blur-sm transition-colors hover:bg-surface-dark"
              type="button"
              aria-label={copy.previous}
              onClick={() => swiper.current?.slidePrev()}
            >
              {isRtl ? <FiChevronRight size={19} /> : <FiChevronLeft size={19} />}
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg bg-surface-dark/75 text-content-inverse backdrop-blur-sm transition-colors hover:bg-surface-dark"
              type="button"
              aria-label={copy.next}
              onClick={() => swiper.current?.slideNext()}
            >
              {isRtl ? <FiChevronLeft size={19} /> : <FiChevronRight size={19} />}
            </button>
          </div>
          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full border border-line bg-white/75 px-3 py-2 backdrop-blur-sm max-[680px]:bottom-2"
            dir="ltr"
          >
            {banners.map((item, position) => (
              <button
                key={item.id}
                className={`h-2 rounded-full transition-[width,background-color] ${position === currentIndex ? "w-5 bg-brand" : "w-2 bg-content-subtle hover:bg-brand-border"}`}
                type="button"
                aria-label={`${copy.slide} ${position + 1}`}
                aria-current={position === currentIndex ? "true" : undefined}
                onClick={() => swiper.current?.slideTo(position)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
