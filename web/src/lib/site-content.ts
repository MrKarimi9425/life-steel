import { cache } from "react";
import type { Metadata } from "next";
import { apiFetch, getLanguages } from "./api";
import type { BlogMedia, BlogNode } from "./blog";
import { siteCopy } from "./site-content-copy";
export { siteCopy, contactHref } from "./site-content-copy";
export type ContactInformation = {
  id: string;
  type: "PHONE" | "EMAIL" | "ADDRESS" | "HOURS" | "LINK";
  title: string;
  value: string;
};
export type SiteContent = {
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
  apiFetch<SiteContent>(
    `public/site-content/${encodeURIComponent(locale)}`,
    true,
  ),
);
export async function sitePageMetadata(
  locale: string,
  kind: "about" | "contact",
): Promise<Metadata> {
  const [content, languages] = await Promise.all([
    getSiteContent(locale),
    getLanguages(),
  ]);
  const root = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const url = new URL(`/${locale}/${kind}`, root).href;
  const title =
    kind === "about"
      ? content?.about?.seoTitle ||
        content?.about?.title ||
        siteCopy(locale).about
      : siteCopy(locale).contact;
  const description =
    kind === "about"
      ? content?.about?.seoDescription || undefined
      : siteCopy(locale).intro;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(kind === "contact"
        ? {
            languages: Object.fromEntries(
              languages.map((l) => [
                l.code,
                new URL(`/${l.code}/${kind}`, root).href,
              ]),
            ),
          }
        : {}),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Life Steel",
    },
    twitter: { card: "summary", title, description },
    ...(kind === "about" && !content?.about
      ? { robots: { index: false } }
      : {}),
  };
}
