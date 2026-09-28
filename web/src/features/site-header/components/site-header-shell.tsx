"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const lastScrollY = useRef(0);
  const downwardDistance = useRef(0);
  const upwardDistance = useRef(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextY = window.scrollY;
        const delta = nextY - lastScrollY.current;

        if (nextY <= 100) {
          setCompact(false);
          downwardDistance.current = 0;
          upwardDistance.current = 0;
        } else {
          if (delta > 0) {
            upwardDistance.current = 0;
            downwardDistance.current += delta;
            if (downwardDistance.current >= 24) setCompact(true);
          } else if (delta < 0) {
            downwardDistance.current = 0;
            upwardDistance.current -= delta;
            if (upwardDistance.current >= 260) setCompact(false);
          }
        }
        lastScrollY.current = nextY;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="site-header-space h-[172px] max-[1025px]:h-[88px] max-[1025px]:transition-[height] max-[1025px]:duration-[280ms] motion-reduce:transition-none">
      <header
        className="site-header fixed inset-x-0 top-0 z-20 w-full bg-white font-[PeydaHeader,Tahoma,Arial,sans-serif] shadow-[0_8px_24px_rgba(32,45,62,.035)]"
        data-compact={compact || undefined}
      >
        {children}
      </header>
    </div>
  );
}
