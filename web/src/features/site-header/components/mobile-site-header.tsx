"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiGrid, FiMenu, FiPhoneCall, FiSearch, FiX } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
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
      className="flex h-[52px] flex-row-reverse items-center rounded-[15px] border border-line bg-surface"
      action={`/${locale}/products`}
      method="get"
      role="search"
      onSubmit={onSubmit}
    >
      <input
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 font-[PeydaHeader,Tahoma,Arial,sans-serif] text-sm font-normal text-content-strong outline-none placeholder:text-content-subtle"
        name="search"
        type="search"
        aria-label={labels.search}
        placeholder={labels.searchPlaceholder}
      />
      <button
        className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center text-content-subtle"
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
    const menuTrigger = menuTriggerRef.current;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuTrigger?.focus();
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <SiteContainer className="hidden h-[88px] items-center justify-between gap-2 border-b border-line-soft max-[1025px]:flex">
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
            <strong className="block whitespace-nowrap font-[Arial,sans-serif] text-base font-black tracking-[.5px]">
              <span className="text-brand">LIFE</span>{" "}
              <span className="text-content-strong">STEEL</span>
            </strong>
            <small className="mt-[3px] block whitespace-nowrap text-[8px] text-content-subtle">
              {brandSubtitle}
            </small>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-[6px]" dir="ltr">
          <button
            ref={menuTriggerRef}
            className={`${mobileActionClass} bg-brand text-content-inverse`}
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
            className={`${mobileActionClass} bg-surface-soft text-brand`}
            href={contactHref}
            aria-label={labels.contact}
          >
            <FiPhoneCall className="h-[22px] w-[22px]" aria-hidden="true" />
          </Link>
          <button
            className={`${mobileActionClass} bg-surface-muted text-content-subtle`}
            type="button"
            aria-label={labels.search}
            aria-expanded={searchOpen}
            aria-controls="mobile-header-search-panel"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <FiSearch className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
        </div>
      </SiteContainer>
      <div
        id="mobile-header-search-panel"
        className="mobile-header-search-panel hidden max-h-0 -translate-y-2 overflow-hidden border-b-0 border-transparent bg-surface opacity-0 transition-[max-height,padding,border-color,opacity,transform] duration-[280ms] data-[open=true]:max-h-[69px] data-[open=true]:translate-y-0 data-[open=true]:border-b data-[open=true]:border-line-soft data-[open=true]:py-2 data-[open=true]:opacity-100 max-[1025px]:block motion-reduce:transition-none"
        data-open={searchOpen}
        aria-hidden={!searchOpen}
        inert={!searchOpen}
      >
        <SiteContainer>
          <SearchForm locale={locale} labels={labels} />
        </SiteContainer>
      </div>
      {mounted &&
        createPortal(
          <div
            className="group fixed inset-0 z-[100] invisible pointer-events-none font-[PeydaHeader,Tahoma,Arial,sans-serif] transition-[visibility] delay-[280ms] data-[open=true]:visible data-[open=true]:pointer-events-auto data-[open=true]:delay-0"
            data-open={drawerOpen}
          >
            <button
              className="absolute inset-0 w-full bg-surface-dark/50 opacity-0 transition-opacity duration-[280ms] group-data-[open=true]:opacity-100 motion-reduce:transition-none"
              type="button"
              aria-label={labels.close}
              tabIndex={drawerOpen ? 0 : -1}
              onClick={closeDrawer}
            />
            <aside
              ref={drawerRef}
              id="mobile-site-drawer"
              className="absolute inset-y-0 start-0 w-[min(360px,calc(100vw-16px))] translate-x-[105%] overflow-hidden bg-surface shadow-panel outline-none transition-transform duration-[280ms] group-data-[open=true]:translate-x-0 ltr:-translate-x-[105%] ltr:group-data-[open=true]:translate-x-0 motion-reduce:transition-none"
              role="dialog"
              aria-modal="true"
              aria-label={labels.menu}
              aria-hidden={!drawerOpen}
              inert={!drawerOpen}
              tabIndex={-1}
            >
              <div className="flex h-[70px] items-center justify-between border-b border-line-soft ps-[18px] pe-[14px] text-lg font-black text-content-strong">
                <strong>{labels.menu}</strong>
                <button
                  className="grid h-10 w-10 place-items-center rounded-[13px] bg-surface-muted text-content-subtle"
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
                    className="group flex min-h-[52px] w-full cursor-pointer items-center gap-[10px] rounded-[15px] border border-line-soft bg-surface px-[15px] font-[PeydaHeader,Tahoma,Arial,sans-serif] text-[15px] font-extrabold text-content-strong aria-[expanded=true]:border-brand aria-[expanded=true]:bg-surface-soft"
                    type="button"
                    aria-expanded={categoriesOpen}
                    aria-controls="mobile-site-drawer-categories"
                    onClick={() => setCategoriesOpen((value) => !value)}
                  >
                    <span>{labels.categories}</span>
                    <FiGrid
                      className="order-first h-[22px] w-[22px] text-brand"
                      aria-hidden="true"
                    />
                    <FiChevronDown
                      className="ms-auto h-[22px] w-[22px] text-brand transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
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
                      <div className="grid gap-2 rounded-[15px] border border-line p-[9px]">
                        {categories.map(
                          (category) =>
                            category.translations[0]?.title && (
                              <Link
                                className="flex min-h-[43px] items-center rounded-xl border border-line px-3 text-sm font-bold text-content hover:border-brand-border"
                                key={category.id}
                                href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                                onClick={closeDrawer}
                              >
                                {category.translations[0].title}
                              </Link>
                            ),
                        )}
                        <Link
                          className="flex min-h-[43px] items-center rounded-xl border border-line px-3 text-sm font-bold text-content hover:border-brand-border"
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
                  className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-[15px] border border-line-soft p-2"
                  aria-label={labels.languages}
                >
                  {languages.map((item) => (
                    <Link
                      className="rounded-[9px] px-[10px] py-[5px] text-[13px] text-content-muted aria-[current=page]:bg-surface-dark aria-[current=page]:text-content-inverse"
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
