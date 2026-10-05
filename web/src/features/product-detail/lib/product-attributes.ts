import type { ProductDetailData } from "@/lib/api";
import { productDetailCopy } from "../product-detail.copy";

type AttributeValue = ProductDetailData["attributeValues"][number];

function decimalText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return null;

  const decimal = value as { s?: unknown; e?: unknown; d?: unknown };
  if (
    (decimal.s === 1 || decimal.s === -1) &&
    typeof decimal.e === "number" &&
    Array.isArray(decimal.d) &&
    decimal.d.every((item) => typeof item === "number")
  ) {
    const digits = decimal.d.join("");
    const point = decimal.e + 1;
    const unsigned =
      point <= 0
        ? `0.${"0".repeat(-point)}${digits}`
        : `${digits.slice(0, point)}${digits.slice(point)}`;
    return decimal.s === -1 ? `-${unsigned}` : unsigned;
  }
  return null;
}

export function productAttributeText(value: AttributeValue, locale: string) {
  const copy = productDetailCopy(locale);
  const unit = value.attribute.translations[0]?.unitLabel;
  const options = value.selectedOptions
    .map((item) => item.option.translations[0]?.label)
    .filter(Boolean)
    .join(locale === "en" ? ", " : "، ");
  const number = decimalText(value.numberValue);

  if (value.translations[0]?.textValue) return value.translations[0].textValue;
  if (options) return options;
  if (number) return `${number}${unit ? ` ${unit}` : ""}`;
  if (value.booleanValue !== null) return value.booleanValue ? copy.yes : copy.no;
  return copy.unknown;
}

export function productSpecifications(product: ProductDetailData, locale: string) {
  return product.attributeValues.map((value, index) => ({
    id: `${value.attribute.translations[0]?.name ?? "attribute"}-${index}`,
    name: value.attribute.translations[0]?.name ?? productDetailCopy(locale).unknown,
    value: productAttributeText(value, locale),
  }));
}
