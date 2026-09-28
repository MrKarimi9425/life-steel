import { notFound } from "next/navigation";
import { getLanguages, getPhrases, getProductCategories } from "@/lib/api";
import { getSiteContent } from "@/lib/site-content";
import { ContactDetails } from "@/components/contact-details";
import { SiteHeader } from "@/features/site-header/components/site-header";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const languages = await getLanguages();
  const language = languages.find((item) => item.code === locale);
  if (!language) notFound();
  const [phrases, categories, content] = await Promise.all([
    getPhrases(locale),
    getProductCategories(locale),
    getSiteContent(locale),
  ]);
  const isFa = locale === "fa";

  return (
    <html
      lang={locale}
      dir={language.direction === "RTL" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
    >
      <body>
        <SiteHeader
          locale={locale}
          languages={languages}
          categories={categories}
          contacts={content?.contacts ?? []}
          phrases={phrases}
        />
        {children}
        <footer id="contact" className="site-footer">
          <div>
            <strong>Life Steel</strong>
            <p>
              {isFa ? "تخصص در ساخت محصولات گرمایشی استیل" : "Stainless steel heating products"}
            </p>
          </div>
          <div>
            <ContactDetails items={content?.contacts ?? []} locale={locale} compact />
          </div>
        </footer>
      </body>
    </html>
  );
}
