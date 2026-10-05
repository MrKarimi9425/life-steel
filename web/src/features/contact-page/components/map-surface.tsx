"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, MapOptions } from "leaflet";
import { siteCopy } from "@/lib/site-content-copy";
import watchMapTiles from "@/lib/watch-map-tiles";

type NeshanLeaflet = typeof import("leaflet") & {
  Map: new (
    element: HTMLElement,
    options: MapOptions & { key: string; maptype: "dreamy" },
  ) => LeafletMap;
};

export function MapSurface({
  latitude,
  longitude,
  locale,
}: {
  latitude: number;
  longitude: number;
  locale: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    let stopWatchingTiles: (() => void) | undefined;
    const key = process.env.NEXT_PUBLIC_NESHAN_WEB_API_KEY;
    void import("@neshan-maps-platform/leaflet")
      .then((module) => {
        if (!active || !container.current) return;
        if (!key) throw new Error("Map key is not configured");
        const L = module.default as NeshanLeaflet;
        map = new L.Map(container.current, {
          key,
          maptype: "dreamy",
          center: [latitude, longitude],
          zoom: 16,
          zoomControl: false,
          attributionControl: true,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
        });
        map.attributionControl.setPrefix(false);
        stopWatchingTiles = watchMapTiles(map, (tilesUnavailable) => {
          if (active) setUnavailable(tilesUnavailable);
        });
        L.marker([latitude, longitude], {
          interactive: false,
          icon: L.divIcon({
            className: "life-steel-map-marker",
            html: "<span>LS</span>",
            iconSize: [48, 58],
            iconAnchor: [24, 58],
          }),
        }).addTo(map);
        observer = new ResizeObserver(() => map?.invalidateSize());
        observer.observe(container.current);
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });
    return () => {
      active = false;
      observer?.disconnect();
      stopWatchingTiles?.();
      map?.remove();
    };
  }, [latitude, longitude]);

  return (
    <>
      <div
        ref={container}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      {unavailable && (
        <p className="absolute top-3.5 inset-x-5 z-[1] m-0 rounded-xl bg-white/95 px-3.5 py-2.5 text-xs leading-7 text-content-strong">
          {siteCopy(locale).mapUnavailable}
        </p>
      )}
    </>
  );
}
