import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ProductPriceText } from "@/components/product-price-text";
import { SiteContainer } from "@/components/site-container";
import { mediaUrl, type ProductCardData } from "@/lib/api";
import { pricingCopy } from "@/lib/product-pricing";
import { homeSectionTitleClass } from "@/features/home-layout/home-layout.styles";
import { ProductRail } from "@/features/home-visual/components/product-rail";

const labels = {
  fa: {
    eyebrow: "محصول پیشنهادی",
    intro: "انتخابی شاخص از مجموعه لایف استیل",
    detail: "مشاهده محصول",
    all: "همه محصولات",
  },
  ar: {
    eyebrow: "منتج مقترح",
    intro: "اختيار مميز من مجموعة لايف ستيل",
    detail: "عرض المنتج",
    all: "كل المنتجات",
  },
  en: {
    eyebrow: "Featured product",
    intro: "A signature choice from the Life Steel collection",
    detail: "View product",
    all: "All products",
  },
} as const;

export function HomeFeaturedProduct({
  locale,
  product,
}: {
  locale: string;
  product: ProductCardData | null;
}) {
  const translation = product?.translations[0];
  if (!product || !translation) return null;

  const copy = labels[locale as keyof typeof labels] ?? labels.en;
  const image = mediaUrl(product.coverMedia?.path ?? null);
  const productHref = `/${locale}/products/${encodeURIComponent(translation.slug)}`;
  const Arrow = locale === "en" ? FiArrowRight : FiArrowLeft;

  return (
    <SiteContainer
      as="section"
      className="grid items-center gap-10 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:gap-10 xl:gap-16"
      aria-label={translation.title}
      dir="ltr"
    >
      <div className="relative mx-auto w-full max-w-[510px] lg:col-start-1 lg:row-start-1">
        <div className="absolute inset-x-2 inset-y-5 rotate-[-2deg] rounded-[34px] border-2 border-brand/45" />
        <div className="absolute -top-4 -right-2 h-24 w-24 rounded-[28px] bg-surface-soft sm:-right-5" />
        <Link
          className="group relative block aspect-[1.08] overflow-hidden rounded-[30px] border border-line bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          href={productHref}
        >
          {image ? (
            <span className="absolute inset-7 overflow-hidden rounded-[22px] sm:inset-10">
              <Image
                className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
                src={image}
                alt={product.coverMedia?.translations[0]?.altText ?? translation.title}
                fill
                sizes="(max-width: 700px) calc(100vw - 96px), 430px"
              />
            </span>
          ) : (
            <span className="absolute inset-0 grid place-items-center">
              <ProductRail black={product.id.charCodeAt(0) % 2 === 0} />
            </span>
          )}
        </Link>
        <div className="absolute -bottom-5 left-5 rounded-2xl border border-line bg-surface px-5 py-3 sm:left-8">
          {product.pricing ? (
            <ProductPriceText
              className="text-sm font-black text-brand"
              pricing={product.pricing}
              locale={locale}
            />
          ) : (
            <strong className="block text-sm font-black text-brand">
              {pricingCopy(locale).contact}
            </strong>
          )}
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-1" dir={locale === "en" ? "ltr" : "rtl"}>
        <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand">
          <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <h2
          className={`mt-4 max-w-[600px] tracking-[-.02em] text-content-strong ${homeSectionTitleClass}`}
        >
          {translation.title}
        </h2>
        <p className="mt-4 max-w-[560px] text-base leading-8 font-semibold text-content-muted sm:text-lg">
          {translation.summary || copy.intro}
        </p>
        <div className="mt-7 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <Link
            className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-brand px-4 text-center text-sm font-black text-content-inverse transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus motion-reduce:transition-none sm:gap-3 sm:px-6"
            href={productHref}
          >
            {copy.detail}
            <Arrow size={17} aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-12 min-w-0 items-center justify-center rounded-full border border-line bg-surface px-4 text-center text-sm font-black text-content transition-[border-color,color] hover:border-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus sm:px-6"
            href={`/${locale}/products`}
          >
            {copy.all}
          </Link>
        </div>
      </div>
    </SiteContainer>
  );
}
