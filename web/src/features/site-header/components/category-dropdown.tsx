"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiGrid, FiMenu, FiX } from "react-icons/fi";
import { mediaUrl, type ProductFilters } from "@/lib/api";

type CategoryDropdownProps = {
  locale: string;
  label: string;
  categories: ProductFilters["categories"];
};

export function CategoryDropdown({ locale, label, categories }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allProductsLabel =
    locale === "fa" ? "همه محصولات" : locale === "ar" ? "كل المنتجات" : "All products";
  const emptyLabel =
    locale === "fa"
      ? "هنوز دسته بندی ثبت نشده است."
      : locale === "ar"
        ? "لا توجد فئات بعد."
        : "No categories yet.";

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="group flex h-[52px] items-center gap-[5px] whitespace-nowrap rounded-2xl border border-[#e3e9f1] bg-white px-[10px] font-[PeydaHeader,Tahoma,Arial,sans-serif] text-base font-black text-[#e57617] shadow-[0_4px_13px_rgba(31,50,77,.045)] transition-[border-color,box-shadow,color] duration-200 hover:border-[#f7bc88] hover:shadow-[0_8px_22px_rgba(247,121,16,.11)] aria-[expanded=true]:border-[#f7bc88] aria-[expanded=true]:shadow-[0_8px_22px_rgba(247,121,16,.11)] motion-reduce:transition-none"
        type="button"
        aria-expanded={open}
        aria-controls="site-category-panel"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            cancelClose();
            setOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
        onClick={(event) => {
          cancelClose();
          if (event.detail === 0) setOpen((value) => !value);
          else setOpen(true);
        }}
      >
        <FiMenu className="h-[21px] w-[21px] shrink-0" aria-hidden="true" />
        <span>{label}</span>
        <FiChevronDown
          className="ms-auto h-[21px] w-[21px] shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </button>
      {open &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[80] font-[PeydaHeader,Tahoma,Arial,sans-serif]">
            <button
              className="pointer-events-auto absolute inset-x-0 bottom-0 top-[170px] w-full cursor-default bg-[rgba(10,15,25,.58)] animate-[site-category-fade_.24s_ease_both] motion-reduce:animate-none"
              type="button"
              aria-label={
                locale === "fa"
                  ? "بستن دسته بندی ها"
                  : locale === "ar"
                    ? "إغلاق الفئات"
                    : "Close categories"
              }
              onClick={() => setOpen(false)}
            />
            <div
              ref={dialogRef}
              id="site-category-panel"
              className="pointer-events-auto absolute top-[170px] left-1/2 flex h-[min(500px,calc(100dvh-190px))] min-h-[250px] w-[min(1120px,calc(100vw-40px))] -translate-x-1/2 flex-col rounded-3xl bg-white p-6 shadow-[0_25px_75px_rgba(20,30,45,.2)] outline-none animate-[site-category-enter_.24s_ease_both] max-[760px]:top-[min(214px,28dvh)] max-[760px]:max-h-[calc(100dvh-min(226px,30dvh))] max-[760px]:w-[calc(100vw-24px)] max-[760px]:rounded-[18px] max-[760px]:p-4 motion-reduce:animate-none"
              role="dialog"
              aria-modal="true"
              aria-label={label}
              tabIndex={-1}
              dir="rtl"
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") cancelClose();
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") scheduleClose();
              }}
            >
              <div className="flex items-center justify-between border-b border-[#edf0f4] pb-4 text-xl font-black text-[#303638]">
                <strong>{label}</strong>
                <button
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f6f8] text-[#8a95a4]"
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={locale === "fa" ? "بستن" : locale === "ar" ? "إغلاق" : "Close"}
                >
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {categories.length ? (
                <nav
                  className="grid flex-1 grid-cols-4 content-start gap-[14px] overflow-y-auto py-[22px] max-[1050px]:grid-cols-3 max-[760px]:grid-cols-1 max-[760px]:gap-[9px] max-[760px]:py-[14px]"
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
                        className="flex min-h-24 min-w-0 items-center gap-3 rounded-2xl border border-[#edf0f4] p-[10px] text-[15px] font-bold text-[#414c59] transition-[border-color,box-shadow] duration-200 hover:border-[#f6b477] hover:shadow-[0_6px_18px_rgba(247,121,16,.12)] focus-visible:border-[#f6b477] max-[760px]:min-h-[70px] max-[760px]:text-[13px] motion-reduce:transition-none"
                        href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="relative grid h-[70px] w-[70px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f6f7f8] font-[Arial,sans-serif] text-[19px] font-black text-[#e57617] max-[760px]:h-[52px] max-[760px]:w-[52px]">
                          {src ? (
                            <Image className="object-contain" src={src} alt="" fill sizes="80px" />
                          ) : (
                            <span aria-hidden="true">LS</span>
                          )}
                        </span>
                        <span>{title}</span>
                        <FiGrid className="ms-auto h-5 w-5 text-[#e57617]" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </nav>
              ) : (
                <p className="flex-1 p-6 text-[#7b8694]">{emptyLabel}</p>
              )}
              <Link
                className="self-start rounded-xl bg-[#fff0e2] px-4 py-[10px] text-sm font-black text-[#c7640b] hover:bg-[#fce0c5]"
                href={`/${locale}/products`}
                onClick={() => setOpen(false)}
              >
                {allProductsLabel} <span aria-hidden="true">←</span>
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
