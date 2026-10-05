import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import type { SiteBanner } from "@/lib/site-content";

function bannerTarget(locale: string, target: string) {
  if (!target.startsWith("/")) return target;
  if (target === `/${locale}` || target.startsWith(`/${locale}/`)) return target;
  return `/${locale}${target}`;
}

export function BannerMedia({
  banner,
  priority = false,
}: {
  banner: SiteBanner;
  priority?: boolean;
}) {
  return (
    <picture className="block h-auto w-full">
      <source
        media="(min-width: 1024px)"
        srcSet={mediaUrl(banner.desktopImage.path) ?? undefined}
      />
      <source media="(min-width: 680px)" srcSet={mediaUrl(banner.tabletImage.path) ?? undefined} />
      <img
        className="block h-auto max-h-none w-full object-contain"
        src={mediaUrl(banner.mobileImage.path) ?? ""}
        alt={banner.altText}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

export function ResponsiveBanner({
  banner,
  locale,
  className = "",
  priority = false,
}: {
  banner: SiteBanner;
  locale: string;
  className?: string;
  priority?: boolean;
}) {
  const content = <BannerMedia banner={banner} priority={priority} />;
  if (!banner.targetUrl)
    return <div className={`block overflow-hidden ${className}`}>{content}</div>;

  const external = !banner.targetUrl.startsWith("/");
  return (
    <Link
      className={`block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${className}`}
      href={bannerTarget(locale, banner.targetUrl)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={banner.altText}
    >
      {content}
    </Link>
  );
}
