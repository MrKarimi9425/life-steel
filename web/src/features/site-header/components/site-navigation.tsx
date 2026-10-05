"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SiteNavigationItem = { href: string; label: string };

type SiteNavigationProps = {
  items: SiteNavigationItem[];
  label: string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

function navigationState(pathname: string, href: string, isHome: boolean) {
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const targetPath = href.replace(/\/$/, "") || "/";

  if (currentPath === targetPath) return "page";
  if (!isHome && currentPath.startsWith(`${targetPath}/`)) return "location";
  return undefined;
}

export function SiteNavigation({ items, label, variant, onNavigate }: SiteNavigationProps) {
  const pathname = usePathname();
  const desktop = variant === "desktop";

  return (
    <nav
      className={
        desktop
          ? "site-header-nav flex h-full items-stretch gap-7 whitespace-nowrap px-[9px]"
          : "grid gap-[10px]"
      }
      aria-label={label}
    >
      {items.map((item, index) => {
        const current = navigationState(pathname, item.href, index === 0);
        const className = desktop
          ? `relative inline-flex items-center text-[15px] font-extrabold transition-colors hover:text-brand hover:after:absolute hover:after:inset-x-0 hover:after:bottom-[6px] hover:after:h-0.5 hover:after:bg-brand hover:after:content-[''] ${current ? "text-brand after:absolute after:inset-x-0 after:bottom-[6px] after:h-0.5 after:bg-brand after:content-['']" : "text-content-muted"}`
          : `flex min-h-[52px] items-center rounded-[15px] border px-[15px] text-[15px] font-extrabold hover:border-brand hover:text-brand-strong ${current ? "border-line bg-surface-soft text-brand-strong" : "border-line-soft text-content-strong"}`;

        return (
          <Link
            className={className}
            key={item.href}
            href={item.href}
            aria-current={current}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
