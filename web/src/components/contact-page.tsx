import { ContactDetails } from "./contact-details";
import { ContactForm } from "./contact-form";
import { LocationMap } from "./location-map";
import { siteCopy, type SiteContent } from "@/lib/site-content";
export function ContactPageContent({
  content,
  locale,
}: {
  content: SiteContent | null;
  locale: string;
}) {
  const t = siteCopy(locale);
  const location = content?.location;
  return (
    <main className="contact-page">
      <header className="contact-hero">
        <div>
          <span className="eyebrow">LIFE STEEL / CONTACT</span>
          <h1>{t.contact}</h1>
        </div>
        <p>{t.intro}</p>
        <span className="contact-hero-mark" aria-hidden="true">
          ↗
        </span>
      </header>
      <div className="contact-content">
        <aside className="contact-information">
          <span className="eyebrow">LIFE STEEL / DETAILS</span>
          <h2>{t.details}</h2>
          <ContactDetails items={content?.contacts ?? []} locale={locale} />
          <div className="contact-brand-stamp" aria-hidden="true">
            <span>LS</span>
            <small>
              STAINLESS STEEL
              <br />
              RADIATORS
            </small>
          </div>
        </aside>
        <ContactForm locale={locale} />
      </div>
      {location?.latitude != null && location.longitude != null && (
        <LocationMap latitude={location.latitude} longitude={location.longitude} locale={locale} />
      )}
    </main>
  );
}
