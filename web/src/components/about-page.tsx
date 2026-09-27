import Image from "next/image";
import { BlockContent } from "./blog-content";
import { BlogGallery } from "./blog-gallery";
import { mediaUrl } from "@/lib/api";
import { siteCopy, type SiteContent } from "@/lib/site-content";
export function AboutPageContent({
  about,
  locale,
}: {
  about: SiteContent["about"];
  locale: string;
}) {
  const t = siteCopy(locale);
  const image = about?.media.find((m) => m.path);
  const src = mediaUrl(image?.path ?? null);
  return (
    <main className="about-page">
      <header className="about-page-hero">
        <div>
          <span className="eyebrow">LIFE STEEL / OUR STORY</span>
          <h1>{about?.title ?? t.about}</h1>
          <span className="about-page-rule" />
        </div>
        {src && image ? (
          <div className="about-page-image">
            <Image
              loading="eager"
              src={src}
              alt={image.translations[0]?.altText ?? about?.title ?? t.about}
              width={image.width ?? 1200}
              height={image.height ?? 1200}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="about-steel-art" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        )}
      </header>
      <section className="about-page-content">
        {about ? (
          <>
            <div className="blog-content">
              <BlockContent content={about.content} media={about.media} />
            </div>
            <BlogGallery
              images={about.media}
              locale={locale}
              title={about.title}
            />
          </>
        ) : (
          <p>{t.noAbout}</p>
        )}
      </section>
    </main>
  );
}
