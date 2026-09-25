import type { MetadataRoute } from "next";
import { getLanguages, getProducts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const languages = await getLanguages();
  const entries: MetadataRoute.Sitemap = [];
  for (const language of languages) {
    entries.push({ url: `${site}/${language.code}`, changeFrequency: "weekly", priority: 1 });
    entries.push({ url: `${site}/${language.code}/products`, changeFrequency: "weekly", priority: 0.9 });
    for (const product of (await getProducts(language.code, { pageSize: "100" })).items) {
      const slug = product.translations[0]?.slug;
      if (slug) entries.push({ url: `${site}/${language.code}/products/${slug}`, changeFrequency: "monthly", priority: 0.8 });
    }
  }
  return entries;
}
