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
          ? `relative inline-flex items-center text-[15px] font-extrabold transition-colors hover:text-[#e57617] hover:after:absolute hover:after:inset-x-0 hover:after:bottom-[6px] hover:after:h-0.5 hover:after:bg-[#f77910] hover:after:content-[''] ${current ? "text-[#e57617] after:absolute after:inset-x-0 after:bottom-[6px] after:h-0.5 after:bg-[#f77910] after:content-['']" : "text-[#6b7280]"}`
          : `flex min-h-[52px] items-center rounded-[15px] border px-[15px] text-[15px] font-extrabold shadow-[0_3px_10px_rgba(23,37,57,.025)] hover:border-[#f8ba85] hover:text-[#df7012] ${current ? "border-[#ffead7] bg-[#fff4eb] text-[#df7012]" : "border-[#eef0f4] text-[#303846]"}`;

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
