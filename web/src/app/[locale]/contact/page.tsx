import { ContactPageContent } from "@/features/contact-page/components/contact-page-content";
import { getSiteContent, sitePageMetadata } from "@/lib/site-content";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  return sitePageMetadata((await params).locale, "contact");
}
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  return <ContactPageContent content={await getSiteContent(locale)} locale={locale} />;
}
