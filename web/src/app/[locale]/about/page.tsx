import { AboutPageContent } from "@/components/about-page";
import { getSiteContent, sitePageMetadata } from "@/lib/site-content";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  return sitePageMetadata((await params).locale, "about");
}
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const content = await getSiteContent(locale);
  return <AboutPageContent about={content?.about ?? null} locale={locale} />;
}
