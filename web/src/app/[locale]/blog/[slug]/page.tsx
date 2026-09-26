import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogDetail } from '@/components/blog-detail';
import { getBlogArticle } from '@/lib/blog';
import { articleSeo } from '@/lib/blog-seo';
import { StructuredData } from '@/components/structured-data';

export const dynamic = 'force-dynamic';
type Params = Promise<{ locale: string; slug: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getBlogArticle(locale, decodeURIComponent(slug));
  if (!article) return {};
  return articleSeo(article, locale).metadata;
}
export default async function BlogArticlePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const article = await getBlogArticle(locale, decodeURIComponent(slug));
  if (!article) notFound();
  return <><StructuredData value={articleSeo(article, locale).structuredData} /><BlogDetail article={article} locale={locale} /></>;
}
