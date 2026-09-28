import type { Metadata } from "next";
import { mediaUrl } from "./api";
import type { BlogArticle } from "./blog";

export function articleSeo(article: BlogArticle, locale: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const url = new URL(`/${locale}/blog/${encodeURIComponent(article.slug)}`, site).href;
  const cover = article.media.find((image) => image.id === article.coverMediaId);
  const imagePath = mediaUrl(cover?.path ?? null);
  const image = imagePath ? new URL(imagePath, site).href : undefined;
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.summary || undefined;
  const images = image
    ? [
        {
          url: image,
          alt: cover?.translations[0]?.altText || article.title,
          ...(cover?.width ? { width: cover.width } : {}),
          ...(cover?.height ? { height: cover.height } : {}),
        },
      ]
    : undefined;
  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        article.translations.map((item) => [
          item.language,
          new URL(`/${item.language}/blog/${encodeURIComponent(item.slug)}`, site).href,
        ]),
      ),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Life Steel",
      publishedTime: article.publishedAt ?? undefined,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: article.title,
    description,
    inLanguage: locale,
    datePublished: article.publishedAt ?? undefined,
    image: image ? [image] : undefined,
    articleSection: article.categories.map((category) => category.title),
    keywords: article.tags.map((tag) => tag.title),
    publisher: {
      "@type": "Organization",
      name: "Life Steel",
      url: new URL(`/${locale}`, site).href,
    },
  };
  return { metadata, structuredData };
}
