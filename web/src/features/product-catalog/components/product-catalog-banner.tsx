import { SiteContainer } from "@/components/site-container";
import { ResponsiveBanner } from "@/features/home-banners/components/responsive-banner";
import type { SiteBanner } from "@/lib/site-content";

export function ProductCatalogBanner({ banner, locale }: { banner: SiteBanner; locale: string }) {
  return (
    <SiteContainer as="section">
      <ResponsiveBanner
        banner={banner}
        locale={locale}
        priority
        className="rounded-2xl border border-line sm:rounded-[20px]"
      />
    </SiteContainer>
  );
}
