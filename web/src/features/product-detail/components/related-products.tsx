import { ProductCard } from "@/features/products/components/product-card";
import type { ProductCardData } from "@/lib/api";
import { productDetailCopy } from "../product-detail.copy";

export function RelatedProducts({
  locale,
  products,
}: {
  locale: string;
  products: ProductCardData[];
}) {
  if (!products.length) return null;
  const copy = productDetailCopy(locale);

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="related-products-title">
      <h2
        id="related-products-title"
        className="mb-6 text-2xl font-black text-content-strong sm:text-3xl"
      >
        {copy.related}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
