import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ProductPriceText } from "@/components/product-price-text";
import { mediaUrl, type ProductCardData } from "@/lib/api";

const labels = {
  fa: { details: "مشاهده محصول", fallback: "لایف استیل" },
  ar: { details: "عرض المنتج", fallback: "لايف ستيل" },
  en: { details: "View product", fallback: "Life Steel" },
} as const;

export function ProductCard({ product, locale }: { product: ProductCardData; locale: string }) {
  const translation = product.translations[0];
  if (!translation) return null;
  const copy = labels[locale as keyof typeof labels] ?? labels.en;
  const image = mediaUrl(product.coverMedia?.path ?? null);
  const category = product.categories.find((item) => item.isPrimary)?.category.translations[0]
    ?.title;
  const isRtl = locale === "fa" || locale === "ar";

  return (
    <Link
      className="group flex h-full min-w-0 flex-col rounded-[20px] border border-line bg-surface p-3 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      href={`/${locale}/products/${translation.slug}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-soft">
        {image ? (
          <Image
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            src={image}
            alt={product.coverMedia?.translations[0]?.altText ?? translation.title}
            fill
            sizes="(max-width: 700px) 92vw, (max-width: 1100px) 40vw, 25vw"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-surface-muted to-surface-soft text-4xl font-black text-content-muted">
            LS
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <span className="mb-2 text-xs font-bold text-brand">{category ?? copy.fallback}</span>
        <h2 className="line-clamp-2 text-base font-extrabold leading-7 text-content-strong">
          {translation.title}
        </h2>
        {translation.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-content-muted">
            {translation.summary}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line-soft pt-4">
          <ProductPriceText
            pricing={product.pricing ?? { showPrice: false, colors: [] }}
            locale={locale}
            className="text-sm font-extrabold text-content-strong"
          />
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-content-muted transition-colors group-hover:text-brand">
            {copy.details}
            {isRtl ? <FiArrowLeft size={15} /> : <FiArrowRight size={15} />}
          </span>
        </div>
      </div>
    </Link>
  );
}
