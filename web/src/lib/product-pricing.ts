export type PublicPricing = {
  showPrice: boolean;
  colors: Array<{
    id: string;
    label: string;
    colorHex: string | null;
    amount?: string | null;
    mediaIds: string[];
    primaryMediaId: string | null;
  }>;
  basePrice?: string | null;
  minimum?: string | null;
  maximum?: string | null;
  hasUnpricedColors?: boolean;
};
const labels = {
  fa: {
    contact: "تماس بگیرید",
    currency: "تومان",
    color: "رنگ محصول",
    all: "همه رنگ ها",
    other: "برای اطلاع از قیمت سایر رنگ ها تماس بگیرید.",
  },
  en: {
    contact: "Contact us",
    currency: "toman",
    color: "Product color",
    all: "All colors",
    other: "Contact us for prices of other colors.",
  },
  ar: {
    contact: "اتصل بنا",
    currency: "تومان",
    color: "لون المنتج",
    all: "جميع الألوان",
    other: "اتصل بنا لمعرفة أسعار الألوان الأخرى.",
  },
};
export function pricingCopy(locale: string) {
  return labels[locale as keyof typeof labels] ?? labels.en;
}
export function pricingText(pricing: PublicPricing, locale: string, colorId = "") {
  const copy = pricingCopy(locale);
  if (!pricing.showPrice) return copy.contact;
  const format = (amount: string) =>
    `${new Intl.NumberFormat(locale).format(Number(amount))} ${copy.currency}`;
  if (colorId) {
    const amount = pricing.colors.find((color) => color.id === colorId)?.amount;
    return amount ? format(amount) : copy.contact;
  }
  if (!pricing.colors.length) return pricing.basePrice ? format(pricing.basePrice) : copy.contact;
  if (!pricing.minimum || !pricing.maximum) return copy.contact;
  return pricing.minimum === pricing.maximum
    ? format(pricing.minimum)
    : `${format(pricing.minimum)} – ${format(pricing.maximum)}`;
}
