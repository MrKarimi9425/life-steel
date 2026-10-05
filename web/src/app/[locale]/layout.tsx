import { notFound } from "next/navigation";
import { getLanguages, getPhrases, getProductCategories } from "@/lib/api";
import { getSiteContent } from "@/lib/site-content";
import { SiteFooter } from "@/features/site-footer/components/site-footer";
import { SiteHeader } from "@/features/site-header/components/site-header";
import { SiteScrollbar } from "@/features/site-scrollbar/components/site-scrollbar";

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
        <SiteScrollbar />
        {children}
        <SiteFooter locale={locale} categories={categories} contacts={content?.contacts ?? []} />
      </body>
    </html>
  );
}
