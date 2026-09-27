"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, MapOptions } from "leaflet";
import { siteCopy } from "@/lib/site-content-copy";
import watchMapTiles from "@/lib/watch-map-tiles";
type NeshanLeaflet = typeof import("leaflet") & {
  Map: new (element: HTMLElement, options: MapOptions & { key: string; maptype: "dreamy" }) => LeafletMap;
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
        stopWatchingTiles = watchMapTiles(map, (unavailable) => {
          if (active) setUnavailable(unavailable);
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
      <div ref={container} className="map-surface" aria-hidden="true" />
      {unavailable && (
        <p className="map-unavailable">{siteCopy(locale).mapUnavailable}</p>
      )}
    </>
  );
}
