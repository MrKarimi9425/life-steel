import {
  contactHref,
  siteCopy,
  type ContactInformation,
} from "@/lib/site-content";
export function ContactDetails({
  items,
  locale,
  compact = false,
}: {
  items: ContactInformation[];
  locale: string;
  compact?: boolean;
}) {
  if (!items.length)
    return <p className="contact-empty">{siteCopy(locale).empty}</p>;
  return (
    <div className={compact ? "contact-details compact" : "contact-details"}>
      {items.map((item, index) => {
        const href = contactHref(item);
        const content = (
          <>
            <span className="contact-item-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p
                dir={
                  ["PHONE", "EMAIL", "LINK"].includes(item.type)
                    ? "ltr"
                    : undefined
                }
              >
                {item.value}
              </p>
            </div>
            {href && (
              <span className="contact-item-arrow" aria-hidden="true">
                ↗
              </span>
            )}
          </>
        );
        return href ? (
          <a
            className="contact-item"
            href={href}
            key={item.id}
            {...(item.type === "LINK"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {content}
          </a>
        ) : (
          <div className="contact-item" key={item.id}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
