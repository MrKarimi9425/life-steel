"use client";
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
  const t = siteCopy(locale);
  return (
    <section className="location-stage" aria-labelledby="location-heading">
      <div className="location-heading">
        <span className="eyebrow">LIFE STEEL / LOCATION</span>
        <h2 id="location-heading">{t.map}</h2>
        <p>{t.mapHint}</p>
        <span className="location-coordinate" dir="ltr">
          {latitude.toFixed(5)}° / {longitude.toFixed(5)}°
        </span>
      </div>
      <div className="location-map">
        <MapSurface latitude={latitude} longitude={longitude} locale={locale} />
        <a
          className="location-map-target"
          href={links.browser}
          aria-label={t.navigate}
          onClick={(event) => {
            const ua = navigator.userAgent;
            const destination = /Android/i.test(ua)
              ? links.android
              : /iPad|iPhone|iPod/i.test(ua) ||
                  (navigator.platform === "MacIntel" &&
                    navigator.maxTouchPoints > 1)
                ? links.apple
                : null;
            if (destination) {
              event.preventDefault();
              window.location.assign(destination);
            }
          }}
        >
          <span className="location-map-button">
            {t.navigate}
            <span aria-hidden="true">↗</span>
          </span>
        </a>
      </div>
    </section>
  );
}
