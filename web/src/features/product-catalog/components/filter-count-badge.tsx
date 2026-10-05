export function FilterCountBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-black tabular-nums leading-none text-white">
      {count}
    </span>
  );
}
