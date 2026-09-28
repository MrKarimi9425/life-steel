"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { mediaUrl, type Media } from "@/lib/api";
import type { PublicPricing } from "@/lib/product-pricing";
import { ProductPricing } from "./product-pricing";

export function ProductIntro({
  pricing,
  locale,
  gallery,
  coverMedia,
  title,
  children,
  footer,
}: {
  pricing: PublicPricing;
  locale: string;
  gallery: Media[];
  coverMedia: Media | null;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const [colorId, setColorId] = useState("");
  const primaryId = pricing.colors.find((color) => color.id === colorId)?.primaryMediaId;
  const colorImage = gallery.find(
    (media) => media.id === primaryId && media.kind === "IMAGE" && media.path,
  );
  const image =
    colorImage ?? coverMedia ?? gallery.find((media) => media.kind === "IMAGE" && media.path);
  const src = mediaUrl(image?.path ?? null);
  return (
    <section className="product-intro">
      <div className="detail-media">
        {src ? (
          <Image
            src={src}
            alt={image?.translations[0]?.altText ?? title}
            fill
            preload
            sizes="(max-width: 900px) 100vw, 55vw"
          />
        ) : (
          <div className="image-placeholder">
            <span>LS</span>
          </div>
        )}
      </div>
      <div className="detail-copy">
        {children}
        <ProductPricing
          pricing={pricing}
          locale={locale}
          colorId={colorId}
          onColorChange={setColorId}
        />
        {footer}
      </div>
    </section>
  );
}
