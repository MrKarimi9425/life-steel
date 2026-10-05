import Image from "next/image";
import { mediaUrl } from "@/lib/api";
import { blogCopy, type BlogMedia } from "@/lib/blog";

export function BlogGallery({
  images,
  locale,
  title,
}: {
  images: BlogMedia[];
  locale: string;
  title: string;
}) {
  if (!images.length) return null;
  return (
    <section className="mt-12 border-t border-line-soft pt-8">
      <h2 className="mb-6 text-2xl font-black text-content-strong">{blogCopy(locale).gallery}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const src = mediaUrl(image.path);
          if (!src) return null;
          const translation = image.translations[0];
          return (
            <figure className="m-0 min-w-0" key={image.id}>
              <a
                className="block overflow-hidden rounded-2xl bg-surface-muted"
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={translation?.title ?? title}
              >
                <Image
                  className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                  src={src}
                  alt={translation?.altText ?? title}
                  width={image.width ?? 1200}
                  height={image.height ?? 1200}
                  sizes="(max-width: 600px) 100vw, 280px"
                />
              </a>
              {translation?.caption && (
                <figcaption className="mt-3 text-center text-xs leading-6 text-content-muted">
                  {translation.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
