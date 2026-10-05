"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft, FiArrowRight, FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { mediaUrl, type ProductFilters } from "@/lib/api";

type CategoryDropdownProps = {
  locale: string;
  label: string;
  categories: ProductFilters["categories"];
};

export function CategoryDropdown({ locale, label, categories }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrame = useRef<number | null>(null);
  const suppressHoverUntil = useRef(0);
  const allProductsLabel =
    locale === "fa" ? "همه محصولات" : locale === "ar" ? "كل المنتجات" : "All products";
  const emptyLabel =
    locale === "fa"
      ? "هنوز دسته بندی ثبت نشده است."
      : locale === "ar"
        ? "لا توجد فئات بعد."
        : "No categories yet.";
  const viewProductsLabel =
    locale === "fa" ? "مشاهده محصولات" : locale === "ar" ? "عرض المنتجات" : "View products";
  const DirectionArrow = locale === "en" ? FiArrowRight : FiArrowLeft;

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openDropdown = () => {
    if (Date.now() < suppressHoverUntil.current) return;
    cancelClose();
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    setMounted(true);
    openFrame.current = requestAnimationFrame(() => {
      setOpen(true);
      openFrame.current = null;
    });
  };
  const closeDropdown = () => {
    cancelClose();
    suppressHoverUntil.current = Date.now() + 260;
    if (openFrame.current) cancelAnimationFrame(openFrame.current);
    openFrame.current = null;
    setOpen(false);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(closeDropdown, 180);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (openFrame.current) cancelAnimationFrame(openFrame.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="group flex h-[52px] items-center gap-[5px] whitespace-nowrap rounded-2xl border border-line bg-surface px-[10px] font-[PeydaHeader,Tahoma,Arial,sans-serif] text-base font-black text-brand transition-[border-color,background-color,color] duration-200 hover:border-brand-border hover:bg-surface-muted aria-[expanded=true]:border-brand-border aria-[expanded=true]:bg-surface-muted motion-reduce:transition-none"
        type="button"
        aria-expanded={open}
        aria-controls="site-category-panel"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            openDropdown();
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
        onClick={(event) => {
          cancelClose();
          if (event.detail === 0 && open) closeDropdown();
          else openDropdown();
        }}
      >
        <FiMenu className="h-[21px] w-[21px] shrink-0" aria-hidden="true" />
        <span>{label}</span>
        <FiChevronDown
          className="ms-auto h-[21px] w-[21px] shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[172px] z-[80] font-[PeydaHeader,Tahoma,Arial,sans-serif]">
            <button
              className="pointer-events-auto absolute inset-0 w-full cursor-default bg-transparent"
              type="button"
              aria-label={
                locale === "fa"
                  ? "بستن دسته بندی ها"
                  : locale === "ar"
                    ? "إغلاق الفئات"
                    : "Close categories"
              }
              onClick={closeDropdown}
            />
            <div
              ref={dialogRef}
              id="site-category-panel"
              className={`pointer-events-auto absolute top-0 left-1/2 flex max-h-[calc(100dvh-190px)] w-[min(1120px,calc(100vw-40px))] flex-col overflow-hidden rounded-3xl bg-surface p-6 shadow-panel outline-none max-[760px]:w-[calc(100vw-24px)] max-[760px]:p-4 motion-reduce:-translate-x-1/2 motion-reduce:animate-none ${
                open
                  ? "animate-[site-category-enter_.24s_ease_both]"
                  : "animate-[site-category-exit_.2s_ease_both]"
              }`}
              role="dialog"
              aria-label={label}
              tabIndex={-1}
              dir="rtl"
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") cancelClose();
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") scheduleClose();
              }}
              onAnimationEnd={(event) => {
                if (event.currentTarget === event.target && !open) setMounted(false);
              }}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line-soft pb-4 text-xl font-black text-content-strong max-[760px]:text-base">
                <strong>{label}</strong>
                <div className="flex items-center gap-2">
                  <Link
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-surface-dark px-4 text-sm font-black text-content-inverse transition-colors duration-200 hover:bg-surface-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-[760px]:px-3 max-[760px]:text-xs motion-reduce:transition-none"
                    href={`/${locale}/products`}
                    onClick={(event) => {
                      event.stopPropagation();
                      closeDropdown();
                    }}
                  >
                    {allProductsLabel}
                    <DirectionArrow className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-content-subtle transition-colors duration-200 hover:bg-line hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none"
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      closeDropdown();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (event.detail === 0) closeDropdown();
                    }}
                    aria-label={locale === "fa" ? "بستن" : locale === "ar" ? "إغلاق" : "Close"}
                  >
                    <FiX className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {categories.length ? (
                <nav
                  className="grid max-h-[calc(100dvh-286px)] grid-cols-3 content-start gap-4 overflow-y-auto py-5 pe-1 max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:py-4"
                  aria-label={label}
                >
                  {categories.map((category) => {
                    const title = category.translations[0]?.title;
                    if (!title) return null;
                    const src =
                      category.image?.kind === "IMAGE" ? mediaUrl(category.image.path) : null;
                    return (
                      <Link
                        key={category.id}
                        className="group/card relative flex min-h-[128px] min-w-0 items-center gap-4 overflow-hidden rounded-[22px] border border-line bg-surface p-3 text-content transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-[760px]:min-h-[92px] max-[760px]:gap-3 max-[760px]:rounded-2xl max-[760px]:p-2.5 motion-reduce:transition-none"
                        href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                        onClick={closeDropdown}
                      >
                        <span className="relative grid h-[102px] w-[102px] shrink-0 place-items-center overflow-hidden rounded-[18px] bg-surface-soft font-[Arial,sans-serif] text-xl font-black text-brand max-[760px]:h-[70px] max-[760px]:w-[70px] max-[760px]:rounded-[14px]">
                          {src ? (
                            <Image
                              className="object-contain p-1 transition-transform duration-300 group-hover/card:scale-105 motion-reduce:transition-none"
                              src={src}
                              alt=""
                              fill
                              sizes="102px"
                            />
                          ) : (
                            <span aria-hidden="true">LS</span>
                          )}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-2">
                          <strong className="line-clamp-2 text-base font-black leading-7 text-content-strong max-[760px]:text-sm">
                            {title}
                          </strong>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-content-subtle transition-colors duration-200 group-hover/card:text-brand-strong motion-reduce:transition-none">
                            {viewProductsLabel}
                            <DirectionArrow
                              className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${
                                locale === "en"
                                  ? "group-hover/card:translate-x-1"
                                  : "group-hover/card:-translate-x-1"
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              ) : (
                <p className="py-8 text-center text-content-muted">{emptyLabel}</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
