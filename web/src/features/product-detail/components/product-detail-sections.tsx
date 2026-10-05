"use client";

import { useState, type ReactNode } from "react";
import { productDetailCopy } from "../product-detail.copy";

type Specification = { id: string; name: string; value: string };

export function ProductDetailSections({
  locale,
  description,
  specifications,
}: {
  locale: string;
  description: ReactNode;
  specifications: Specification[];
}) {
  const copy = productDetailCopy(locale);
  const [tab, setTab] = useState<"description" | "specifications">("description");

  return (
    <section className="mt-16 overflow-hidden rounded-[24px] border border-line bg-surface sm:mt-20 sm:rounded-[28px]">
      <div className="flex gap-2 overflow-x-auto border-b border-line px-4 pt-4 sm:px-7 sm:pt-5">
        {(
          [
            ["description", copy.description],
            ["specifications", copy.specifications],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-selected={tab === value}
            role="tab"
            className={`relative shrink-0 px-4 pb-4 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:text-base ${tab === value ? "text-content-strong after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand" : "text-content-muted hover:text-content-strong"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-5 sm:p-8 lg:p-10">
        {tab === "description" ? (
          description
        ) : (
          <dl className="grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
            {specifications.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(100px,0.45fr)_minmax(0,0.55fr)] gap-4 border-b border-line-soft px-4 py-4 md:odd:border-e md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <dt className="text-sm text-content-muted">{item.name}</dt>
                <dd className="m-0 text-sm font-extrabold text-content-strong">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
