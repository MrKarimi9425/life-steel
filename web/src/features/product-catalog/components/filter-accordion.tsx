"use client";

import type { ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FilterCountBadge } from "./filter-count-badge";

export function FilterAccordion({
  title,
  open,
  selectedCount = 0,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  selectedCount?: number;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line-soft pb-3 last:border-0 last:pb-0">
      <button
        className="flex w-full items-center justify-between gap-3 py-2 text-start text-sm font-extrabold text-content-strong"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          <FilterCountBadge count={selectedCount} />
        </span>
        <FiChevronDown
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          size={17}
        />
      </button>
      <div
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 pb-1 pt-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
