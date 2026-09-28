"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiGrid, FiMenu, FiPhoneCall, FiSearch, FiX } from "react-icons/fi";
import type { Language, ProductFilters } from "@/lib/api";
import { SiteNavigation, type SiteNavigationItem } from "./site-navigation";

type MobileSiteHeaderProps = {
  locale: string;
  brandSubtitle: string;
  categories: ProductFilters["categories"];
  languages: Language[];
  navigation: SiteNavigationItem[];
  contactHref: string;
  labels: {
    menu: string;
    close: string;
    search: string;
    searchPlaceholder: string;
    categories: string;
    allProducts: string;
    contact: string;
    languages: string;
  };
};

function SearchForm({
  locale,
  labels,
  onSubmit,
}: Pick<MobileSiteHeaderProps, "locale" | "labels"> & { onSubmit?: () => void }) {
  return (
    <form
      className="flex h-[52px] flex-row-reverse items-center rounded-[15px] border border-[#ebedf1] bg-white"
      action={`/${locale}/products`}
      method="get"
      role="search"
      onSubmit={onSubmit}
    >
      <input
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 font-[PeydaHeader,Tahoma,Arial,sans-serif] text-sm font-normal text-[#29313b] outline-none placeholder:text-[#a8b2c0]"
        name="search"
        type="search"
        aria-label={labels.search}
        placeholder={labels.searchPlaceholder}
      />
      <button
        className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center text-[#9facbe]"
        type="submit"
        aria-label={labels.search}
      >
        <FiSearch className="h-[22px] w-[22px]" aria-hidden="true" />
      </button>
    </form>
  );
}

const mobileActionClass =
  "grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-[15px] transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-[.96] max-[370px]:h-11 max-[370px]:w-11 motion-reduce:transition-none";

export function MobileSiteHeader({
  locale,
  brandSubtitle,
  categories,
  languages,
  navigation,
  contactHref,
  labels,
}: MobileSiteHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuTriggerRef.current?.focus();
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div className="hidden h-[88px] items-center justify-between gap-2 border-b border-[#f1f2f4] px-[14px] max-[1025px]:flex">
        <Link
          className="flex min-w-0 items-center gap-[7px]"
          href={`/${locale}`}
          aria-label="Life Steel"
        >
          <Image
            className="h-[50px] w-[50px] shrink-0 object-contain max-[370px]:h-11 max-[370px]:w-11"
            src="/life-steel-mark.png"
            alt=""
            width={56}
            height={56}
            priority
          />
          <span className="block min-w-0 max-[370px]:hidden">
            <strong className="block whitespace-nowrap font-[Arial,sans-serif] text-base font-black tracking-[.5px] text-[#252d35]">
              LIFE STEEL
            </strong>
            <small className="mt-[3px] block whitespace-nowrap text-[8px] text-[#8a95a4]">
              {brandSubtitle}
            </small>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-[6px]" dir="ltr">
          <button
            ref={menuTriggerRef}
            className={`${mobileActionClass} bg-[#f77910] text-white`}
            type="button"
            aria-label={labels.menu}
            aria-expanded={drawerOpen}
            aria-controls="mobile-site-drawer"
            onClick={() => {
              setSearchOpen(false);
              setDrawerOpen(true);
            }}
          >
            <FiMenu className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
          <Link
            className={`${mobileActionClass} bg-[#fff0e2] text-[#e57617]`}
            href={contactHref}
            aria-label={labels.contact}
          >
            <FiPhoneCall className="h-[22px] w-[22px]" aria-hidden="true" />
          </Link>
          <button
            className={`${mobileActionClass} bg-[#f6f8fa] text-[#8290a1]`}
            type="button"
            aria-label={labels.search}
            aria-expanded={searchOpen}
            aria-controls="mobile-header-search-panel"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <FiSearch className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        id="mobile-header-search-panel"
        className="mobile-header-search-panel hidden max-h-0 -translate-y-2 overflow-hidden border-b-0 border-transparent bg-white px-[14px] opacity-0 transition-[max-height,padding,border-color,opacity,transform] duration-[280ms] data-[open=true]:max-h-[69px] data-[open=true]:translate-y-0 data-[open=true]:border-b data-[open=true]:border-[#eff1f4] data-[open=true]:py-2 data-[open=true]:opacity-100 max-[1025px]:block motion-reduce:transition-none"
        data-open={searchOpen}
        aria-hidden={!searchOpen}
        inert={!searchOpen}
      >
        <SearchForm locale={locale} labels={labels} />
      </div>
      {mounted &&
        createPortal(
          <div
            className="group fixed inset-0 z-[100] invisible pointer-events-none font-[PeydaHeader,Tahoma,Arial,sans-serif] transition-[visibility] delay-[280ms] data-[open=true]:visible data-[open=true]:pointer-events-auto data-[open=true]:delay-0"
            data-open={drawerOpen}
          >
            <button
              className="absolute inset-0 w-full bg-[rgba(20,26,34,.48)] opacity-0 transition-opacity duration-[280ms] group-data-[open=true]:opacity-100 motion-reduce:transition-none"
              type="button"
              aria-label={labels.close}
              tabIndex={drawerOpen ? 0 : -1}
              onClick={closeDrawer}
            />
            <aside
              ref={drawerRef}
              id="mobile-site-drawer"
              className="absolute inset-y-0 start-0 w-[min(360px,calc(100vw-16px))] translate-x-[105%] overflow-hidden bg-white shadow-[0_20px_55px_rgba(20,26,34,.14)] outline-none transition-transform duration-[280ms] group-data-[open=true]:translate-x-0 ltr:-translate-x-[105%] ltr:group-data-[open=true]:translate-x-0 motion-reduce:transition-none"
              role="dialog"
              aria-modal="true"
              aria-label={labels.menu}
              aria-hidden={!drawerOpen}
              inert={!drawerOpen}
              tabIndex={-1}
            >
              <div className="flex h-[70px] items-center justify-between border-b border-[#eff1f4] ps-[18px] pe-[14px] text-lg font-black text-[#252b33]">
                <strong>{labels.menu}</strong>
                <button
                  className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#f6f8fa] text-[#8b97a5]"
                  type="button"
                  aria-label={labels.close}
                  onClick={closeDrawer}
                >
                  <FiX className="h-[22px] w-[22px]" aria-hidden="true" />
                </button>
              </div>
              <div className="flex h-[calc(100dvh-70px)] flex-col gap-[11px] overflow-y-auto px-[14px] pt-3 pb-[30px] [scrollbar-gutter:stable]">
                <SearchForm locale={locale} labels={labels} onSubmit={closeDrawer} />
                <div className="flex flex-col">
                  <button
                    className="group flex min-h-[52px] w-full cursor-pointer items-center gap-[10px] rounded-[15px] border border-[#eef0f4] bg-white px-[15px] font-[PeydaHeader,Tahoma,Arial,sans-serif] text-[15px] font-extrabold text-[#303846] shadow-[0_3px_10px_rgba(23,37,57,.025)] aria-[expanded=true]:border-[#ffead7] aria-[expanded=true]:bg-[#fff4eb]"
                    type="button"
                    aria-expanded={categoriesOpen}
                    aria-controls="mobile-site-drawer-categories"
                    onClick={() => setCategoriesOpen((value) => !value)}
                  >
                    <span>{labels.categories}</span>
                    <FiGrid
                      className="order-first h-[22px] w-[22px] text-[#ef7b18]"
                      aria-hidden="true"
                    />
                    <FiChevronDown
                      className="ms-auto h-[22px] w-[22px] text-[#ef7b18] transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,margin-top,opacity] duration-[280ms] data-[open=true]:mt-[11px] data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 motion-reduce:transition-none"
                    data-open={categoriesOpen}
                  >
                    <nav
                      id="mobile-site-drawer-categories"
                      className="min-h-0 overflow-hidden"
                      aria-label={labels.categories}
                      aria-hidden={!categoriesOpen}
                      inert={!categoriesOpen}
                    >
                      <div className="grid gap-2 rounded-[15px] border border-[#f2eee9] p-[9px]">
                        {categories.map(
                          (category) =>
                            category.translations[0]?.title && (
                              <Link
                                className="flex min-h-[43px] items-center rounded-xl border border-[#f0f1f4] px-3 text-sm font-bold text-[#505b69] hover:border-[#f8ba85]"
                                key={category.id}
                                href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                                onClick={closeDrawer}
                              >
                                {category.translations[0].title}
                              </Link>
                            ),
                        )}
                        <Link
                          className="flex min-h-[43px] items-center rounded-xl border border-[#f0f1f4] px-3 text-sm font-bold text-[#505b69] hover:border-[#f8ba85]"
                          href={`/${locale}/products`}
                          onClick={closeDrawer}
                        >
                          {labels.allProducts}
                        </Link>
                      </div>
                    </nav>
                  </div>
                </div>
                <SiteNavigation
                  items={navigation}
                  label={labels.menu}
                  variant="mobile"
                  onNavigate={closeDrawer}
                />
                <div
                  className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-[15px] border border-[#eef0f4] p-2 shadow-[0_3px_10px_rgba(23,37,57,.025)]"
                  aria-label={labels.languages}
                >
                  {languages.map((item) => (
                    <Link
                      className="rounded-[9px] px-[10px] py-[5px] text-[13px] text-[#6b7481] aria-[current=page]:bg-[#fff0e2] aria-[current=page]:text-[#c7640b]"
                      key={item.code}
                      href={`/${item.code}`}
                      aria-current={item.code === locale ? "page" : undefined}
                      onClick={closeDrawer}
                    >
                      {item.nativeName}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
