import type { HTMLAttributes, ReactNode } from "react";

type ContentPanelElement = "article" | "div" | "section";

type ContentPanelProps = HTMLAttributes<HTMLElement> & {
  as?: ContentPanelElement;
  children: ReactNode;
};

export function ContentPanel({
  as: Component = "section",
  children,
  className = "",
  ...props
}: ContentPanelProps) {
  return (
    <Component
      className={`mx-auto min-w-0 max-w-[1115px] rounded-3xl border border-line-soft bg-surface p-7 shadow-[0_14px_40px_rgb(15_23_42/0.05)] ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
