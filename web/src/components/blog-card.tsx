import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl } from '@/lib/api';
import { blogCopy, type BlogCardData } from '@/lib/blog';

export function BlogCard({ article, locale }: { article: BlogCardData; locale: string }) {
  const src = mediaUrl(article.cover?.path ?? null);
  return <Link className="product-card" href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}>
    <div className="product-image">
      {src ? <Image src={src} alt={article.cover?.translations[0]?.altText ?? article.title} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" /> : <div className="image-placeholder"><span>LS</span></div>}
    </div>
    <div className="product-card-body">
      <span className="eyebrow">LIFE STEEL JOURNAL</span>
      <h3>{article.title}</h3>
      {article.summary && <p>{article.summary}</p>}
      <span className="card-link">{blogCopy(locale).read}</span>
    </div>
  </Link>;
}
