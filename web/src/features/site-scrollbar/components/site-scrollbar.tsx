"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type ScrollbarMetrics = {
  top: number;
  trackHeight: number;
  thumbHeight: number;
  thumbTop: number;
  maxScroll: number;
};

const emptyMetrics: ScrollbarMetrics = {
  top: 0,
  trackHeight: 0,
  thumbHeight: 0,
  thumbTop: 0,
  maxScroll: 0,
};

export function SiteScrollbar() {
  const [metrics, setMetrics] = useState(emptyMetrics);
  const dragState = useRef<{ pointerY: number; scrollY: number } | null>(null);

  const measure = useCallback(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const top = Math.max(0, Math.round(header?.getBoundingClientRect().bottom ?? 0));
    const trackHeight = Math.max(0, window.innerHeight - top);
    const pageHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, pageHeight - window.innerHeight);
    const thumbHeight = maxScroll
      ? Math.max(34, Math.round((window.innerHeight / pageHeight) * trackHeight))
      : trackHeight;
    const availableTravel = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = maxScroll ? Math.round((window.scrollY / maxScroll) * availableTravel) : 0;

    setMetrics({ top, trackHeight, thumbHeight, thumbTop, maxScroll });
  }, []);

  useEffect(() => {
    let frame = 0;
    const scheduleMeasure = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    const header = document.querySelector<HTMLElement>(".site-header");
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(document.body);
    if (header) observer.observe(header);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    scheduleMeasure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [measure]);

  const scrollFromTrackPosition = (pointerY: number) => {
    const availableTravel = metrics.trackHeight - metrics.thumbHeight;
    if (!metrics.maxScroll || availableTravel <= 0) return;
    const target = Math.min(
      availableTravel,
      Math.max(0, pointerY - metrics.top - metrics.thumbHeight / 2),
    );
    window.scrollTo({ top: (target / availableTravel) * metrics.maxScroll });
  };

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    scrollFromTrackPosition(event.clientY);
  };

  const handleThumbPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { pointerY: event.clientY, scrollY: window.scrollY };
  };

  const handleThumbPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const availableTravel = metrics.trackHeight - metrics.thumbHeight;
    if (availableTravel <= 0) return;
    const delta = event.clientY - dragState.current.pointerY;
    window.scrollTo({
      top: dragState.current.scrollY + (delta / availableTravel) * metrics.maxScroll,
    });
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
  };

  if (!metrics.maxScroll || !metrics.trackHeight) return null;

  return (
    <div
      className="fixed right-0 z-[90] w-2 touch-none"
      style={{ top: metrics.top, height: metrics.trackHeight }}
      aria-hidden="true"
      onPointerDown={handleTrackPointerDown}
    >
      <div
        className="absolute right-0 h-auto w-1 cursor-grab touch-none rounded-full border-0 bg-brand p-0 active:cursor-grabbing"
        style={{ top: metrics.thumbTop, height: metrics.thumbHeight }}
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>
  );
}
