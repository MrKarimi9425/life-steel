"use client";

import type { ChangeEventHandler } from "react";
import { FiCheck } from "react-icons/fi";

export function FilterChoiceInput({
  type,
  checked,
  name,
  onChange,
}: {
  type: "checkbox" | "radio";
  checked: boolean;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <span className="relative grid h-5 w-5 shrink-0 place-items-center">
      <input
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0"
        type={type}
        checked={checked}
        name={name}
        onChange={onChange}
      />
      <span
        className={`grid h-5 w-5 place-items-center border transition-[border-color,background-color,transform,box-shadow] duration-200 peer-hover:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/25 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface ${
          type === "radio" ? "rounded-full" : "rounded-md"
        } ${checked ? "scale-100 border-brand bg-brand" : "scale-95 border-brand/45 bg-white"}`}
        aria-hidden="true"
      >
        {checked && type === "checkbox" && (
          <FiCheck className="text-white" strokeWidth={3} size={14} />
        )}
        {checked && type === "radio" && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </span>
  );
}
