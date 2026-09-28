import type { MetadataRoute } from "next";
import { getLanguages, getProducts } from "@/lib/api";
import { getBlogArticles } from "@/lib/blog";
import { getSiteContent } from "@/lib/site-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const languages = await getLanguages();
  const entries: MetadataRoute.Sitemap = [];
  for (const language of languages) {
    entries.push({ url: `${site}/${language.code}`, changeFrequency: "weekly", priority: 1 });
    entries.push({
      url: `${site}/${language.code}/products`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    entries.push({
      url: `${site}/${language.code}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    entries.push({
      url: `${site}/${language.code}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    if ((await getSiteContent(language.code))?.about)
      entries.push({
        url: `${site}/${language.code}/about`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    let blogPage = 1;
    while (true) {
      const articles = await getBlogArticles(language.code, { page: String(blogPage) }, 100);
      if (!articles) break;
      for (const article of articles.items) {
        entries.push({
          url: `${site}/${language.code}/blog/${encodeURIComponent(article.slug)}`,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
      if (blogPage * articles.pageSize >= articles.total || !articles.items.length) break;
      blogPage++;
    }
    let productPage = 1;
    while (true) {
      const products = await getProducts(language.code, {
        page: String(productPage),
        pageSize: "100",
      });
      for (const product of products.items) {
        const slug = product.translations[0]?.slug;
        if (slug)
          entries.push({
            url: `${site}/${language.code}/products/${encodeURIComponent(slug)}`,
            changeFrequency: "monthly",
            priority: 0.8,
          });
      }
      if (productPage * products.pageSize >= products.total || !products.items.length) break;
      productPage++;
    }
  }
  const seenUrls = new Set<string>();
  return entries.filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });
}
