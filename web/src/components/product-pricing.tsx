"use client";

import { pricingCopy, pricingText, type PublicPricing } from "@/lib/product-pricing";

export function ProductPricing({
  pricing,
  locale,
  colorId,
  onColorChange,
}: {
  pricing: PublicPricing;
  locale: string;
  colorId: string;
  onColorChange: (id: string) => void;
}) {
  const copy = pricingCopy(locale);
  return (
    <div>
      {pricing.colors.length > 0 && (
        <div className="catalog-filters">
          <label>
            {copy.color}
            <select
              aria-label={copy.color}
              value={colorId}
              onChange={(event) => onColorChange(event.target.value)}
            >
              <option value="">{copy.all}</option>
              {pricing.colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <p className="lead" aria-live="polite">
        {pricingText(pricing, locale, colorId)}
      </p>
      {!colorId && pricing.showPrice && pricing.minimum && pricing.hasUnpricedColors && (
        <p>{copy.other}</p>
      )}
    </div>
  );
}
