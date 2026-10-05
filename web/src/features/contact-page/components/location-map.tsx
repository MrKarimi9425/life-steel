"use client";

import { FiNavigation } from "react-icons/fi";
import { mapLinks } from "@/lib/map-links";
import { siteCopy } from "@/lib/site-content-copy";
import { MapSurface } from "./map-surface";

export function LocationMap({
  latitude,
  longitude,
  locale,
}: {
  latitude: number;
  longitude: number;
  locale: string;
}) {
  const links = mapLinks(latitude, longitude);
  const copy = siteCopy(locale);

  return (
    <section
      className="grid min-h-[390px] grid-cols-[.7fr_1.3fr] overflow-hidden rounded-[28px] bg-surface-darker text-content-inverse max-[850px]:grid-cols-1"
      aria-labelledby="location-heading"
    >
      <div className="relative flex flex-col bg-[radial-gradient(ellipse_at_0_100%,var(--theme-surface-dark),transparent_80%)] px-9 py-10 max-[850px]:p-7">
        <h2
          className="mt-0 mb-4 text-[clamp(26px,3vw,38px)] leading-[1.5] font-black"
          id="location-heading"
        >
          {copy.map}
        </h2>
        <p className="m-0 text-sm leading-7 text-content-dark-muted">{copy.mapHint}</p>
        <span
          className="mt-auto pt-8 font-sans text-[11px] tracking-[.08em] text-content-dark-muted max-[850px]:pt-4"
          dir="ltr"
        >
          {latitude.toFixed(5)}° / {longitude.toFixed(5)}°
        </span>
      </div>
      <div className="relative min-h-[390px] bg-map-surface max-[850px]:min-h-[320px]">
        <MapSurface latitude={latitude} longitude={longitude} locale={locale} />
        <a
          className="absolute inset-0 z-[1] flex items-end justify-center pb-7 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-brand"
          href={links.browser}
          aria-label={copy.navigate}
          onClick={(event) => {
            const userAgent = navigator.userAgent;
            const destination = /Android/i.test(userAgent)
              ? links.android
              : /iPad|iPhone|iPod/i.test(userAgent) ||
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
                ? links.apple
                : null;
            if (destination) {
              event.preventDefault();
              window.location.assign(destination);
            }
          }}
        >
          <span className="flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-3 text-xs font-extrabold text-content-strong transition-transform hover:-translate-y-0.5">
            <FiNavigation className="text-brand" size={17} aria-hidden="true" />
            {copy.navigate}
          </span>
        </a>
      </div>
    </section>
  );
}
