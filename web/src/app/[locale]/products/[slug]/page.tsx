import type { Metadata } from "next";
import Image from "next/image";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import { getProduct, mediaUrl } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { ProductIntro } from "@/components/product-intro";
import { BlockContent } from "@/components/blog-content";
import { pageSeo } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(locale, decodeURIComponent(slug));
  const translation = product?.translations[0];
  const cover = product?.coverMedia;
  const image = mediaUrl(cover?.path ?? null);
  return translation
    ? pageSeo({
        path: `/${locale}/products/${encodeURIComponent(translation.slug)}`,
        title: translation.seoTitle || translation.title,
        description: translation.seoDescription || translation.summary || undefined,
        ...(image && cover?.kind === "IMAGE"
          ? {
              image: {
                path: image,
                alt: cover.translations[0]?.altText || translation.title,
                width: cover.width,
                height: cover.height,
              },
            }
          : {}),
      })
    : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const product = await getProduct(locale, decodeURIComponent(slug));
  if (!product || !product.translations[0]) notFound();
  const translation = product.translations[0];
  const isFa = locale === "fa";
  const gallery = product.media.map((item) => item.media);
  const description = translation.description ?? "";
  const richDescription = /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|a)\b/i.test(description);
  const safeDescription = sanitizeHtml(description, {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return (
    <main className="product-detail">
      <ProductIntro
        pricing={product.pricing}
        locale={locale}
        gallery={gallery}
        coverMedia={product.coverMedia}
        title={translation.title}
        footer={
          <a className="button primary" href={`/${locale}/contact`}>
            {isFa ? "درخواست مشاوره" : "Request consultation"}
          </a>
        }
      >
        <span key="category" className="eyebrow">
          {product.categories.find((item) => item.isPrimary)?.category.translations[0]?.title ??
            "LIFE STEEL"}
        </span>
        <h1 key="title">{translation.title}</h1>
        {product.sku && (
          <p key="sku" className="sku">
            SKU / {product.sku}
          </p>
        )}
        {translation.summary && (
          <p key="summary" className="lead">
            {translation.summary}
          </p>
        )}
      </ProductIntro>
      {gallery.length > 0 && (
        <section className="media-gallery">
          {gallery.map((media, index) => {
            const src = mediaUrl(media.path);
            return media.kind === "IMAGE" && src ? (
              <div className="gallery-item" key={`${media.path}-${index}`}>
                <Image
                  src={src}
                  alt={media.translations[0]?.altText ?? translation.title}
                  fill
                  sizes="33vw"
                />
              </div>
            ) : media.kind === "VIDEO" && src ? (
              <div className="gallery-item" key={`${media.path}-${index}`}>
                <video
                  controls
                  preload="metadata"
                  src={src}
                  aria-label={media.translations[0]?.title ?? translation.title}
                />
              </div>
            ) : media.kind === "VIDEO" && media.externalUrl ? (
              <div className="gallery-item external-video" key={`${media.externalUrl}-${index}`}>
                <a href={media.externalUrl} target="_blank" rel="noopener noreferrer">
                  {media.translations[0]?.title ?? (isFa ? "تماشای ویدیو" : "Watch video")}
                </a>
              </div>
            ) : null;
          })}
        </section>
      )}
      <section className="product-content">
        <article>
          <span className="eyebrow">DETAILS</span>
          <h2>{isFa ? "درباره محصول" : "About this product"}</h2>
          {translation.content ? (
            <BlockContent content={translation.content} media={gallery} />
          ) : (
            <div className="description">
              {richDescription ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
              ) : (
                description.split("\n").map((line, index) => <p key={index}>{line}</p>)
              )}
            </div>
          )}
        </article>
        <aside>
          <h2>{isFa ? "مشخصات فنی" : "Specifications"}</h2>
          <dl>
            {product.attributeValues.map((value, index) => {
              const name = value.attribute.translations[0]?.name;
              const unit = value.attribute.translations[0]?.unitLabel;
              const option = value.selectedOptions
                .map((item) => item.option.translations[0]?.label)
                .filter(Boolean)
                .join("، ");
              const displayValue =
                value.translations[0]?.textValue ||
                option ||
                (value.numberValue !== null
                  ? `${value.numberValue}${unit ? ` ${unit}` : ""}`
                  : value.booleanValue === null
                    ? "—"
                    : value.booleanValue
                      ? isFa
                        ? "بله"
                        : "Yes"
                      : isFa
                        ? "خیر"
                        : "No");
              return (
                <div key={index}>
                  <dt>{name}</dt>
                  <dd>{displayValue}</dd>
                </div>
              );
            })}
          </dl>
        </aside>
      </section>
      {product.relatedProducts?.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>{isFa ? "محصولات مرتبط" : "Related products"}</h2>
          </div>
          <div className="product-grid">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
