export function formatBlogDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const dateLocale = locale === "fa" ? "fa-IR-u-ca-persian" : locale === "ar" ? "ar" : "en";
  return new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
