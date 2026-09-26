import Image from 'next/image';
import { mediaUrl } from '@/lib/api';
import { blogCopy, type BlogMedia } from '@/lib/blog';

export function BlogGallery({ images, locale, title }: { images: BlogMedia[]; locale: string; title: string }) {
  if (!images.length) return null;
  return <section className="article-gallery">
    <h2>{blogCopy(locale).gallery}</h2>
    <div className="article-gallery-grid">{images.map((image) => {
      const src = mediaUrl(image.path);
      if (!src) return null;
      const translation = image.translations[0];
      return <figure key={image.id}>
        <a href={src} target="_blank" rel="noopener noreferrer" aria-label={translation?.title ?? title}><Image src={src} alt={translation?.altText ?? title} width={image.width ?? 1200} height={image.height ?? 1200} sizes="(max-width: 600px) 100vw, 280px" /></a>
        {translation?.caption && <figcaption>{translation.caption}</figcaption>}
      </figure>;
    })}</div>
  </section>;
}
