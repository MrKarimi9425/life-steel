"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { FiFilter, FiX } from "react-icons/fi";
import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react";

export function BlogFilterDrawer({
  title,
  closeLabel,
  activeCount,
  isRtl,
  children,
}: {
  title: string;
  closeLabel: string;
  activeCount: number;
  isRtl: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <LazyMotion features={domAnimation} strict>
      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line bg-surface px-4 text-sm font-extrabold text-content-strong sm:w-auto lg:hidden"
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <FiFilter aria-hidden="true" />
        {title}
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-brand text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] lg:hidden">
            <m.button
              className="absolute inset-0 bg-transparent"
              type="button"
              aria-label={closeLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.aside
              className="absolute inset-y-0 start-0 flex h-dvh max-h-dvh w-[min(90vw,370px)] flex-col overflow-hidden border-e border-line bg-surface shadow-panel"
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
                <h2 className="text-lg font-black text-content-strong">{title}</h2>
                <button
                  className="grid size-10 place-items-center rounded-full bg-surface-muted text-content-strong"
                  type="button"
                  aria-label={closeLabel}
                  onClick={() => setOpen(false)}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                {children}
              </div>
            </m.aside>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
