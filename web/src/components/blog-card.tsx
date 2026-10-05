import { BlogArticleCard } from "@/features/blog-listing/components/blog-article-card";
import type { BlogCardData } from "@/lib/blog";

export function BlogCard({ article, locale }: { article: BlogCardData; locale: string }) {
  return <BlogArticleCard article={article} locale={locale} />;
}
