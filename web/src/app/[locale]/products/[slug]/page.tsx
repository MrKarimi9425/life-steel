import type { Metadata } from "next";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import { getProduct, mediaUrl } from "@/lib/api";
import { BlockContent } from "@/components/blog-content";
import { SiteContainer } from "@/components/site-container";
import { ProductOverview } from "@/features/product-detail/components/product-overview";
import { ProductDetailSections } from "@/features/product-detail/components/product-detail-sections";
import { RelatedProducts } from "@/features/product-detail/components/related-products";
import { productDetailCopy } from "@/features/product-detail/product-detail.copy";
import { productSpecifications } from "@/features/product-detail/lib/product-attributes";
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
  const copy = productDetailCopy(locale);
  const gallery = product.media.map((item) => item.media);
  const primaryCategory = product.categories.find((item) => item.isPrimary)?.category
    .translations[0];
  const category = primaryCategory?.title ?? "LIFE STEEL";
  const specifications = productSpecifications(product, locale);
  const description = translation.description ?? "";
  const richDescription = /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|a)\b/i.test(description);
  const safeDescription = sanitizeHtml(description, {
    allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
  });

  return (
    <main className="pb-20 pt-6 sm:pb-24 sm:pt-8">
      <SiteContainer>
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-xs text-content-muted sm:mb-8"
          aria-label="Breadcrumb"
        >
          <Link className="transition-colors hover:text-brand" href={`/${locale}`}>
            {copy.home}
          </Link>
          <span aria-hidden="true">/</span>
          <Link className="transition-colors hover:text-brand" href={`/${locale}/products`}>
            {copy.products}
          </Link>
          {primaryCategory && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                className="transition-colors hover:text-brand"
                href={`/${locale}/products?categoryId=${encodeURIComponent(product.categories.find((item) => item.isPrimary)?.categoryId ?? "")}`}
              >
                {primaryCategory.title}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 text-content-strong">{translation.title}</span>
        </nav>

        <ProductOverview
          locale={locale}
          title={translation.title}
          summary={translation.summary}
          sku={product.sku}
          category={category}
          pricing={product.pricing}
          coverMedia={product.coverMedia}
          gallery={gallery}
          specifications={specifications}
        />

        <ProductDetailSections
          locale={locale}
          specifications={specifications}
          description={
            translation.content ? (
              <BlockContent content={translation.content} media={gallery} />
            ) : description ? (
              <div className="article-content">
                {richDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
                ) : (
                  description.split("\n").map((line, index) => <p key={index}>{line}</p>)
                )}
              </div>
            ) : (
              <p className="text-content-muted">{copy.noDescription}</p>
            )
          }
        />

        <RelatedProducts locale={locale} products={product.relatedProducts ?? []} />
      </SiteContainer>
    </main>
  );
}
