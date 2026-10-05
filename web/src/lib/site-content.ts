import { cache } from "react";
import type { Metadata } from "next";
import { apiFetch, getLanguages } from "./api";
import type { BlogMedia, BlogNode } from "./blog";
import { siteCopy } from "./site-content-copy";
import { pageSeo } from "./page-seo";
export { siteCopy, contactHref } from "./site-content-copy";
export type ContactInformation = {
  id: string;
  type: "PHONE" | "EMAIL" | "ADDRESS" | "HOURS" | "LINK";
  title: string;
  value: string;
};
export type SiteBanner = {
  id: string;
  altText: string;
  targetUrl: string;
  desktopImage: { path: string; width: number | null; height: number | null };
  tabletImage: { path: string; width: number | null; height: number | null };
  mobileImage: { path: string; width: number | null; height: number | null };
};
export type HomeSectionType =
  | "HERO"
  | "CATEGORIES"
  | "FEATURED_PRODUCT"
  | "SELECTED_PRODUCTS"
  | "BENEFITS"
  | "BLOG"
  | "CONTACT"
  | "BANNER_FULL"
  | "BANNER_SPLIT";
export type HomeSection = {
  id: string;
  type: HomeSectionType;
  displayOrder: number;
  banners: SiteBanner[];
};
export type SiteContent = {
  homePage: {
    selectedProductsLimit: number;
    sections: HomeSection[];
  };
  products: {
    banner: SiteBanner | null;
  };
  blog: {
    banner: SiteBanner | null;
  };
  about: {
    title: string;
    content: BlogNode;
    seoTitle: string | null;
    seoDescription: string | null;
    media: BlogMedia[];
  } | null;
  contacts: ContactInformation[];
  location: { latitude: number | null; longitude: number | null } | null;
};
export const getSiteContent = cache(async (locale: string) =>
  apiFetch<SiteContent>(`public/site-content/${encodeURIComponent(locale)}`, true),
);
export async function sitePageMetadata(
  locale: string,
  kind: "about" | "contact",
): Promise<Metadata> {
  const [content, languages] = await Promise.all([getSiteContent(locale), getLanguages()]);
  const availableLanguages =
    kind === "contact"
      ? languages
      : (
          await Promise.all(
            languages.map(async (language) => ({
              language,
              content: await getSiteContent(language.code),
            })),
          )
        )
          .filter((item) => item.content?.about)
          .map((item) => item.language);
  const title =
    kind === "about"
      ? content?.about?.seoTitle || content?.about?.title || siteCopy(locale).about
      : siteCopy(locale).contact;
  const description =
    kind === "about" ? content?.about?.seoDescription || undefined : siteCopy(locale).intro;
  return {
    ...pageSeo({
      path: `/${locale}/${kind}`,
      title,
      description,
      languagePaths: Object.fromEntries(
        availableLanguages.map((language) => [language.code, `/${language.code}/${kind}`]),
      ),
    }),
    ...(kind === "about" && !content?.about ? { robots: { index: false } } : {}),
  };
}
