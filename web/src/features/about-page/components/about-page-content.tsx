import Image from "next/image";
import { BlogContent } from "@/components/blog-content";
import { BlogGallery } from "@/components/blog-gallery";
import { ContentPanel } from "@/components/content-panel";
import { SiteContainer } from "@/components/site-container";
import { HomeContact } from "@/features/home-contact/components/home-contact";
import { mediaUrl } from "@/lib/api";
import { siteCopy, type SiteContent } from "@/lib/site-content";

type AboutContent = SiteContent["about"];

export function AboutPageContent({ about, locale }: { about: AboutContent; locale: string }) {
  const copy = siteCopy(locale);
  const cover = about?.media.find((media) => media.path) ?? null;
  const coverSource = mediaUrl(cover?.path ?? null);
  const gallery = about?.media.filter((media) => media.id !== cover?.id) ?? [];

  return (
    <main className="bg-surface py-14 sm:py-9 lg:py-10">
      <SiteContainer>
        <ContentPanel>
          <h1 className="my-5 text-[32px] leading-[1.45] font-bold text-content-strong [overflow-wrap:anywhere]">
            {about?.title ?? copy.about}
          </h1>

          {about ? (
            <>
              {coverSource && (
                <div className="relative aspect-[1.386/1] overflow-hidden rounded-[28px] bg-surface-muted">
                  <Image
                    className="object-cover"
                    src={coverSource}
                    alt={cover?.translations[0]?.altText ?? about.title}
                    fill
                    loading="eager"
                    sizes="(max-width: 640px) calc(100vw - 88px), (max-width: 1200px) calc(100vw - 104px), 1057px"
                  />
                </div>
              )}

              <BlogContent content={about.content} media={about.media} />
              <BlogGallery images={gallery} locale={locale} title={about.title} />
            </>
          ) : (
            <p className="mt-6 mb-0 text-base leading-8 text-content-muted">{copy.noAbout}</p>
          )}
        </ContentPanel>
      </SiteContainer>

      <div className="mt-16">
        <HomeContact locale={locale} />
      </div>
    </main>
  );
}
