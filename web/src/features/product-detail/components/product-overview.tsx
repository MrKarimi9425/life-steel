"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiCheckCircle, FiHeadphones, FiPhoneCall } from "react-icons/fi";
import { ProductPriceText } from "@/components/product-price-text";
import { mediaUrl, type Media } from "@/lib/api";
import type { PublicPricing } from "@/lib/product-pricing";
import { productDetailCopy } from "../product-detail.copy";

type Specification = { id: string; name: string; value: string };

function uniqueImages(coverMedia: Media | null, gallery: Media[]) {
  const images = [coverMedia, ...gallery].filter((media): media is Media =>
    Boolean(media?.id && media.kind === "IMAGE" && media.path),
  );
  return images.filter(
    (media, index) => images.findIndex((item) => item.id === media.id) === index,
  );
}

export function ProductOverview({
  locale,
  title,
  summary,
  sku,
  category,
  pricing,
  coverMedia,
  gallery,
  specifications,
}: {
  locale: string;
  title: string;
  summary: string | null;
  sku: string | null;
  category: string;
  pricing: PublicPricing;
  coverMedia: Media | null;
  gallery: Media[];
  specifications: Specification[];
}) {
  const copy = productDetailCopy(locale);
  const images = useMemo(() => uniqueImages(coverMedia, gallery), [coverMedia, gallery]);
  const [colorId, setColorId] = useState("");
  const [activeMediaId, setActiveMediaId] = useState(coverMedia?.id ?? images[0]?.id ?? "");
  const activeImage = images.find((media) => media.id === activeMediaId) ?? images[0];
  const activeSrc = mediaUrl(activeImage?.path ?? null);

  function selectColor(id: string) {
    setColorId(id);
    if (!id) {
      setActiveMediaId(coverMedia?.id ?? images[0]?.id ?? "");
      return;
    }
    const primaryMediaId = pricing.colors.find((color) => color.id === id)?.primaryMediaId;
    if (primaryMediaId && images.some((image) => image.id === primaryMediaId)) {
      setActiveMediaId(primaryMediaId);
    }
  }

  return (
    <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:gap-12">
      <div className="min-w-0 lg:sticky lg:top-28">
        <div className="relative aspect-square overflow-hidden rounded-[28px] border border-line bg-surface-soft sm:rounded-[32px]">
          {activeSrc ? (
            <Image
              className="object-contain p-5 sm:p-8"
              src={activeSrc}
              alt={activeImage?.translations[0]?.altText ?? title}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-5xl font-black text-content-muted">
              LS
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.map((image) => {
              const src = mediaUrl(image.path);
              const active = image.id === activeImage?.id;
              return src ? (
                <button
                  key={image.id}
                  type="button"
                  aria-label={image.translations[0]?.title ?? title}
                  aria-pressed={active}
                  onClick={() => setActiveMediaId(image.id)}
                  className={`relative aspect-square overflow-hidden rounded-2xl bg-surface-soft transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active ? "ring-2 ring-brand ring-offset-2" : ""}`}
                >
                  <Image className="object-contain p-2" src={src} alt="" fill sizes="110px" />
                </button>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <span className="inline-flex rounded-full bg-brand/10 px-3 py-1.5 text-xs font-extrabold text-brand-strong">
          {copy.available}
        </span>
        <h1 className="mt-5 text-3xl leading-[1.55] font-black text-content-strong sm:text-4xl lg:text-[42px]">
          {title}
        </h1>
        <p className="mt-2 text-sm font-bold text-brand">{category}</p>
        {summary && <p className="mt-5 text-base leading-8 text-content-muted">{summary}</p>}
        {sku && (
          <p className="mt-4 text-sm text-content-muted">
            {copy.sku}:{" "}
            <bdi className="font-bold text-content-strong" dir="ltr">
              {sku}
            </bdi>
          </p>
        )}

        {specifications.length > 0 && (
          <dl className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface">
            {specifications.slice(0, 5).map((item) => (
              <div
                className="grid grid-cols-[minmax(100px,0.42fr)_minmax(0,0.58fr)] gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0 sm:px-5"
                key={item.id}
              >
                <dt className="text-sm text-content-muted">{item.name}</dt>
                <dd className="m-0 text-sm font-extrabold text-content-strong">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {pricing.colors.length > 0 && (
          <fieldset className="mt-7">
            <legend className="mb-3 text-sm font-extrabold text-content-strong">
              {copy.color}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => selectColor("")}
                aria-pressed={!colorId}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${!colorId ? "bg-surface-dark text-content-inverse" : "bg-surface-muted text-content-muted hover:text-content-strong"}`}
              >
                {copy.allColors}
              </button>
              {pricing.colors.map((color) => {
                const active = color.id === colorId;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => selectColor(color.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active ? "border-brand text-content-strong" : "border-line text-content-muted hover:text-content-strong"}`}
                  >
                    <span
                      className="size-5 rounded-full border border-black/10"
                      style={{ backgroundColor: color.colorHex ?? "#d5d7da" }}
                      aria-hidden="true"
                    />
                    {color.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-7 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <span className="text-sm font-bold text-content-muted">{copy.price}</span>
          <ProductPriceText
            pricing={pricing}
            locale={locale}
            colorId={colorId}
            className="mt-2 block text-xl font-black text-content-strong sm:text-2xl"
          />
          <Link
            href={`/${locale}/contact`}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-content-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <FiPhoneCall className="size-5" aria-hidden="true" />
            {copy.consultation}
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4">
            <FiCheckCircle className="size-6 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-sm font-bold leading-6 text-content-strong">
              {copy.preciseInformation}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4">
            <FiHeadphones className="size-6 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-sm font-bold leading-6 text-content-strong">
              {copy.directSupport}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
