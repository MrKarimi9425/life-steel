import { pricingCopy, type PublicPricing } from "@/lib/product-pricing";

function PriceAmount({ amount, locale }: { amount: string; locale: string }) {
  const copy = pricingCopy(locale);
  const formattedAmount = new Intl.NumberFormat(locale).format(Number(amount));

  return (
    <span
      className="inline-flex items-baseline gap-1 whitespace-nowrap"
      dir={locale === "en" ? "ltr" : "rtl"}
    >
      <bdi dir="ltr">{formattedAmount}</bdi>
      <span>{copy.currency}</span>
    </span>
  );
}

export function ProductPriceText({
  pricing,
  locale,
  colorId = "",
  className,
}: {
  pricing: PublicPricing;
  locale: string;
  colorId?: string;
  className?: string;
}) {
  const copy = pricingCopy(locale);
  const direction = locale === "en" ? "ltr" : "rtl";

  if (!pricing.showPrice) return <span className={className}>{copy.contact}</span>;

  const selectedAmount = colorId
    ? pricing.colors.find((color) => color.id === colorId)?.amount
    : null;
  if (colorId) {
    return selectedAmount ? (
      <span className={className}>
        <PriceAmount amount={selectedAmount} locale={locale} />
      </span>
    ) : (
      <span className={className}>{copy.contact}</span>
    );
  }

  if (!pricing.colors.length) {
    return pricing.basePrice ? (
      <span className={className}>
        <PriceAmount amount={pricing.basePrice} locale={locale} />
      </span>
    ) : (
      <span className={className}>{copy.contact}</span>
    );
  }

  if (!pricing.minimum || !pricing.maximum) {
    return <span className={className}>{copy.contact}</span>;
  }

  if (pricing.minimum === pricing.maximum) {
    return (
      <span className={className}>
        <PriceAmount amount={pricing.minimum} locale={locale} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-wrap items-center justify-center gap-1.5 ${className ?? ""}`}
      dir={direction}
    >
      <PriceAmount amount={pricing.minimum} locale={locale} />
      <span aria-hidden="true">–</span>
      <PriceAmount amount={pricing.maximum} locale={locale} />
    </span>
  );
}
