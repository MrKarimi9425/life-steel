import type { CSSProperties } from "react";

export function ProductRail({ black = false }: { black?: boolean }) {
  const metal = black
    ? "linear-gradient(90deg,var(--theme-surface-darker),var(--theme-content) 32%,var(--theme-surface-dark) 68%,var(--theme-surface-darker))"
    : "linear-gradient(90deg,var(--theme-content-muted),var(--theme-surface-muted) 22%,var(--theme-steel-middle) 48%,var(--theme-content-muted) 80%,var(--theme-surface-soft))";

  return (
    <div
      className="relative flex h-[236px] w-[142px] flex-col justify-between py-[5px] drop-shadow-[var(--theme-shadow-object)] before:absolute before:inset-y-0 before:start-0 before:w-[11px] before:rounded-lg before:bg-(--rail-metal) after:absolute after:inset-y-0 after:end-0 after:w-[11px] after:rounded-lg after:bg-(--rail-metal)"
      style={{ "--rail-metal": metal } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: 11 }, (_, index) => (
        <span className="block h-[9px] w-full rounded-[7px] bg-(--rail-metal)" key={index} />
      ))}
    </div>
  );
}
