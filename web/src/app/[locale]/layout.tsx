import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguages, getPhrases } from "@/lib/api";
import { blogCopy } from "@/lib/blog";
import { getSiteContent, siteCopy } from "@/lib/site-content";
import { ContactDetails } from "@/components/contact-details";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const languages = await getLanguages();
  const language = languages.find((item) => item.code === locale);
  if (!language) notFound();
  const phrases = await getPhrases(locale);
  const t = (key: string, fallback: string) => phrases[`site.${key}`] ?? fallback;
  const isFa = locale === "fa";
  const content = await getSiteContent(locale);

  return (
    <html lang={locale} dir={language.direction === "RTL" ? "rtl" : "ltr"} data-scroll-behavior="smooth">
      <body>
        <header className="site-header">
          <Link className="brand" href={`/${locale}`}>
            <span className="brand-mark">LS</span>
            <span>Life Steel</span>
          </Link>
          <nav>
            <Link href={`/${locale}`}>{t("common.home", isFa ? "خانه" : "Home")}</Link>
            <Link href={`/${locale}/products`}>{t("common.products", isFa ? "محصولات" : "Products")}</Link>
            <Link href={`/${locale}/blog`}>{t("common.blog", blogCopy(locale).blog)}</Link>
            <Link href={`/${locale}/about`}>{t("common.about", siteCopy(locale).about)}</Link>
            <Link href={`/${locale}/contact`}>{t("common.contact", siteCopy(locale).contact)}</Link>
          </nav>
          <div className="language-switcher">
            {languages.map((item) => (
              <Link className={item.code === locale ? "active" : ""} href={`/${item.code}`} key={item.code}>
                {item.code.toUpperCase()}
              </Link>
            ))}
          </div>
        </header>
        {children}
        <footer id="contact" className="site-footer">
          <div><strong>Life Steel</strong><p>{isFa ? "تخصص در ساخت محصولات گرمایشی استیل" : "Stainless steel heating products"}</p></div>
          <div><ContactDetails items={content?.contacts ?? []} locale={locale} compact /></div>
        </footer>
      </body>
    </html>
  );
}
