'use client';
import { useParams } from 'next/navigation';
import { blogCopy } from '@/lib/blog';
export default function BlogError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const copy = blogCopy(locale);
  return <main className="section listing-page"><div className="empty-state" role="alert"><p>{copy.error}</p><button className="button primary" type="button" onClick={retry}>{copy.retry}</button></div></main>;
}
