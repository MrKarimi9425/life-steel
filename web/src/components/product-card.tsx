import Image from "next/image";
import Link from "next/link";
import { mediaUrl, type ProductCardData } from "@/lib/api";

export function ProductCard({ product, locale }: { product: ProductCardData; locale: string }) {
  const translation = product.translations[0];
  if (!translation) return null;
  const image = mediaUrl(product.coverMedia?.path ?? null);

  return (
    <Link className="product-card" href={`/${locale}/products/${translation.slug}`}>
      <div className="product-image">
        {image ? (
          <Image src={image} alt={product.coverMedia?.translations[0]?.altText ?? translation.title} fill sizes="(max-width: 760px) 100vw, 33vw" />
        ) : (
          <div className="image-placeholder"><span>LS</span></div>
        )}
      </div>
      <div className="product-card-body">
        <span className="eyebrow">{product.categories.find((item) => item.isPrimary)?.category.translations[0]?.title ?? "Life Steel"}</span>
        <h3>{translation.title}</h3>
        {translation.summary && <p>{translation.summary}</p>}
        <span className="card-link">{locale === "fa" ? "مشاهده جزئیات ←" : "View details →"}</span>
      </div>
    </Link>
  );
}
