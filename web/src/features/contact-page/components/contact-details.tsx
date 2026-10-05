import type { IconType } from "react-icons";
import {
  FiArrowUpLeft,
  FiArrowUpRight,
  FiClock,
  FiLink,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { contactHref, siteCopy, type ContactInformation } from "@/lib/site-content";

const icons: Record<ContactInformation["type"], IconType> = {
  PHONE: FiPhone,
  EMAIL: FiMail,
  ADDRESS: FiMapPin,
  HOURS: FiClock,
  LINK: FiLink,
};

export function ContactDetails({ items, locale }: { items: ContactInformation[]; locale: string }) {
  if (!items.length) {
    return (
      <p className="m-0 rounded-2xl border border-dashed border-line bg-surface-muted px-5 py-6 text-sm leading-7 text-content-muted">
        {siteCopy(locale).empty}
      </p>
    );
  }

  const Arrow = locale === "en" ? FiArrowUpRight : FiArrowUpLeft;

  return (
    <section aria-labelledby="contact-details-title">
      <h2 className="mb-5 text-xl font-black text-content-strong" id="contact-details-title">
        {siteCopy(locale).details}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const href = contactHref(item);
          const Icon = icons[item.type];
          const body = (
            <>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-soft text-xl text-brand">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-bold text-content-muted">
                  {item.title}
                </span>
                <span
                  className="block text-sm leading-7 font-extrabold text-content-strong [overflow-wrap:anywhere] whitespace-pre-line"
                  dir={["PHONE", "EMAIL", "LINK"].includes(item.type) ? "ltr" : undefined}
                >
                  {item.value}
                </span>
              </span>
              {href && (
                <Arrow
                  className="shrink-0 text-lg text-content-muted transition-transform duration-300 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              )}
            </>
          );
          const className =
            "group flex min-h-24 items-center gap-4 rounded-[20px] border border-line-soft bg-surface px-5 py-4 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none";

          return href ? (
            <a
              className={className}
              href={href}
              key={item.id}
              {...(item.type === "LINK" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {body}
            </a>
          ) : (
            <div className={className} key={item.id}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
