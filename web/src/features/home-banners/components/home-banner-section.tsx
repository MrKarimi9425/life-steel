import { SiteContainer } from "@/components/site-container";
import type { HomeSection } from "@/lib/site-content";
import { ResponsiveBanner } from "./responsive-banner";

export function HomeBannerSection({ section, locale }: { section: HomeSection; locale: string }) {
  const split = section.type === "BANNER_SPLIT";
  const banners = section.banners.slice(0, split ? 2 : 1);
  if ((!split && banners.length !== 1) || (split && banners.length !== 2)) return null;

  return (
    <SiteContainer as="section">
      <div className={split ? "grid grid-cols-2 gap-5 max-[680px]:grid-cols-1" : "block"}>
        {banners.map((banner) => (
          <ResponsiveBanner
            key={banner.id}
            banner={banner}
            locale={locale}
            className="rounded-[22px] border border-line max-[680px]:rounded-2xl"
          />
        ))}
      </div>
    </SiteContainer>
  );
}
