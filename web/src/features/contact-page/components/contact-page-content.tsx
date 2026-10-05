import { ContentPanel } from "@/components/content-panel";
import { SiteContainer } from "@/components/site-container";
import { siteCopy, type SiteContent } from "@/lib/site-content";
import { ContactDetails } from "./contact-details";
import { ContactForm } from "./contact-form";
import { LocationMap } from "./location-map";

export function ContactPageContent({
  content,
  locale,
}: {
  content: SiteContent | null;
  locale: string;
}) {
  const copy = siteCopy(locale);
  const location = content?.location;

  return (
    <main className="bg-surface py-14 sm:py-9 lg:py-10">
      <SiteContainer>
        <ContentPanel>
          <header className="mb-9 max-w-3xl">
            <h1 className="my-5 text-[32px] leading-[1.45] font-bold text-content-strong [overflow-wrap:anywhere]">
              {copy.contact}
            </h1>
            <p className="m-0 text-base leading-8 text-content-muted">{copy.intro}</p>
          </header>

          <ContactDetails items={content?.contacts ?? []} locale={locale} />

          <div className="mt-8">
            <ContactForm locale={locale} />
          </div>

          {location?.latitude != null && location.longitude != null && (
            <div className="mt-8">
              <LocationMap
                latitude={location.latitude}
                longitude={location.longitude}
                locale={locale}
              />
            </div>
          )}
        </ContentPanel>
      </SiteContainer>
    </main>
  );
}
