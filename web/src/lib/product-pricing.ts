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
