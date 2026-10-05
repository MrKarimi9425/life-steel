import type { HTMLAttributes, ReactNode } from "react";

type SiteContainerElement = "div" | "section" | "nav";

type SiteContainerProps = HTMLAttributes<HTMLElement> & {
  as?: SiteContainerElement;
  children: ReactNode;
};

export function SiteContainer({
  as: Component = "div",
  children,
  className = "",
  ...props
}: SiteContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
