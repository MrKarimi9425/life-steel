import Image from "next/image";
import Link from "next/link";
import { FiExternalLink, FiGlobe, FiPhoneCall, FiSearch } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import type { Language, ProductFilters } from "@/lib/api";
import { blogCopy } from "@/lib/blog";
import { contactHref, siteCopy, type ContactInformation } from "@/lib/site-content";
import { CategoryDropdown } from "./category-dropdown";
import { MobileSiteHeader } from "./mobile-site-header";
import { SiteHeaderShell } from "./site-header-shell";
import { SiteNavigation } from "./site-navigation";

type SiteHeaderProps = {
  locale: string;
  languages: Language[];
  categories: ProductFilters["categories"];
  contacts: ContactInformation[];
  phrases: Record<string, string>;
};

export function SiteHeader({ locale, languages, categories, contacts, phrases }: SiteHeaderProps) {
  const isFa = locale === "fa";
  const t = (key: string, fallback: string) => phrases[`site.${key}`] ?? fallback;
  const phone = contacts.find((item) => item.type === "PHONE" && item.value.trim());
  const phoneHref = phone ? contactHref(phone) : null;
  const contactPageHref = `/${locale}/contact`;
  const contactLabel = isFa ? "تماس با ما" : locale === "ar" ? "اتصل بنا" : "Contact us";
  const languagesLabel = isFa ? "انتخاب زبان" : locale === "ar" ? "اختر اللغة" : "Choose language";
  const brandSubtitle = isFa
    ? "رادیاتور و حوله خشک کن استیل"
    : locale === "ar"
      ? "مشعات ومجففات مناشف"
      : "Radiators and towel warmers";
  const searchLabel = isFa
    ? "جستجوی محصولات"
    : locale === "ar"
      ? "البحث عن المنتجات"
      : "Search products";
  const searchPlaceholder = isFa
    ? "جستجوی محصولات، مدل، دسته بندی..."
    : locale === "ar"
      ? "ابحث عن منتج أو فئة..."
      : "Search products, models, categories...";
  const categoryLabel = isFa
    ? "دسته بندی محصولات"
    : locale === "ar"
      ? "فئات المنتجات"
      : "Product categories";
  const navigation = [
    { href: `/${locale}`, label: t("common.home", isFa ? "خانه" : "Home") },
    { href: `/${locale}/products`, label: t("common.products", isFa ? "محصولات" : "Products") },
    { href: `/${locale}/blog`, label: t("common.blog", blogCopy(locale).blog) },
    { href: contactPageHref, label: t("common.contact", siteCopy(locale).contact) },
    { href: `/${locale}/about`, label: t("common.about", siteCopy(locale).about) },
  ];

  return (
    <SiteHeaderShell>
      <MobileSiteHeader
        locale={locale}
        brandSubtitle={brandSubtitle}
        categories={categories}
        languages={languages}
        navigation={navigation}
        contactHref={phoneHref ?? contactPageHref}
        labels={{
          menu: isFa ? "منو" : locale === "ar" ? "القائمة" : "Menu",
          close: isFa ? "بستن منو" : locale === "ar" ? "إغلاق القائمة" : "Close menu",
          search: searchLabel,
          searchPlaceholder,
          categories: categoryLabel,
          allProducts: isFa ? "همه محصولات" : locale === "ar" ? "كل المنتجات" : "All products",
          contact: contactLabel,
          languages: languagesLabel,
        }}
      />
      <SiteContainer className="grid h-[104px] grid-cols-[190px_minmax(0,1fr)_344px] items-center gap-5 max-[1025px]:hidden">
        <Link
          className="flex min-w-0 items-center gap-[7px] font-black"
          href={`/${locale}`}
          aria-label="Life Steel"
        >
          <Image
            className="h-14 w-14 shrink-0 object-contain"
            src="/life-steel-mark.png"
            alt=""
            width={72}
            height={72}
            priority
          />
          <span className="block min-w-0">
            <strong className="block whitespace-nowrap font-[Arial,sans-serif] text-[19px] font-black tracking-[.8px]">
              <span className="text-brand">LIFE</span>{" "}
              <span className="text-content-strong">STEEL</span>
            </strong>
            <small className="mt-[3px] block whitespace-nowrap text-[9px] font-normal text-content-subtle">
              {brandSubtitle}
            </small>
          </span>
        </Link>
        <form
          className="flex h-[66px] min-w-0 items-center rounded-[18px] border border-line bg-surface focus-within:border-brand"
          action={`/${locale}/products`}
          method="get"
          role="search"
        >
          <input
            className="h-full min-w-0 flex-1 border-0 bg-transparent ps-6 pe-2 text-[15px] text-content-strong outline-none placeholder:text-content-subtle"
            name="search"
            type="search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
          />
          <button
            className="grid h-[58px] w-[58px] shrink-0 cursor-pointer place-items-center text-content-subtle transition-colors hover:text-brand"
            type="submit"
            aria-label={isFa ? "جستجو" : locale === "ar" ? "بحث" : "Search"}
          >
            <FiSearch className="h-[26px] w-[26px]" aria-hidden="true" />
          </button>
        </form>
        <div className="flex items-center gap-[10px]" dir="ltr">
          <Link
            className="inline-flex h-[58px] w-[173px] items-center justify-center gap-[11px] whitespace-nowrap rounded-[18px] bg-brand text-base font-bold text-content-inverse transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-brand-hover motion-reduce:transition-none"
            href={contactPageHref}
          >
            <FiExternalLink className="h-6 w-6" aria-hidden="true" />
            <span>
              {isFa ? "مشاوره انتخاب" : locale === "ar" ? "استشارة الاختيار" : "Consultation"}
            </span>
          </Link>
          <details className="relative z-[3] shrink-0">
            <summary
              className="grid h-14 w-14 cursor-pointer list-none place-items-center rounded-[18px] bg-surface-soft text-brand transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-line-soft [&::-webkit-details-marker]:hidden"
              aria-label={languagesLabel}
              title={languagesLabel}
            >
              <FiGlobe className="h-[25px] w-[25px]" aria-hidden="true" />
            </summary>
            <div className="absolute top-[calc(100%+9px)] left-0 grid min-w-[90px] rounded-xl border border-line bg-surface p-[5px] shadow-panel">
              {languages.map((item) => (
                <Link
                  className="rounded-lg px-3 py-2 text-center text-xs font-extrabold text-content-muted hover:bg-surface-soft hover:text-brand-strong aria-[current=page]:bg-surface-dark aria-[current=page]:text-content-inverse"
                  aria-current={item.code === locale ? "page" : undefined}
                  href={`/${item.code}`}
                  key={item.code}
                >
                  {item.code.toUpperCase()}
                </Link>
              ))}
            </div>
          </details>
          <Link
            className="grid h-14 w-14 place-items-center rounded-[18px] bg-surface-soft text-brand transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-line-soft motion-reduce:transition-none"
            href={phoneHref ?? contactPageHref}
            aria-label={contactLabel}
            title={contactLabel}
          >
            <FiPhoneCall className="h-[25px] w-[25px]" aria-hidden="true" />
          </Link>
        </div>
      </SiteContainer>
      <SiteContainer
        className={`site-header-menu-row grid h-[68px] items-center gap-x-[14px] overflow-hidden border-t border-line-soft transition-[height,opacity,transform,visibility] duration-[240ms] max-[1025px]:hidden ${phoneHref ? "grid-cols-[209px_minmax(0,1fr)_150px]" : "grid-cols-[209px_minmax(0,1fr)]"}`}
      >
        <CategoryDropdown locale={locale} categories={categories} label={categoryLabel} />
        <SiteNavigation
          items={navigation}
          label={isFa ? "ناوبری اصلی" : "Main navigation"}
          variant="desktop"
        />
        {phone && phoneHref ? (
          <Link
            className="flex items-center justify-self-end gap-[9px] text-center text-content-subtle hover:text-brand"
            href={phoneHref}
          >
            <span className="order-2 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-muted text-content-subtle">
              <FiPhoneCall className="h-[22px] w-[22px]" aria-hidden="true" />
            </span>
            <span>
              <small className="block text-xs font-normal leading-normal">
                {isFa ? "پشتیبانی" : locale === "ar" ? "الدعم" : "Support"}
              </small>
              <strong
                className="block whitespace-nowrap text-[13px] font-bold leading-normal"
                dir="ltr"
              >
                {phone.value}
              </strong>
            </span>
          </Link>
        ) : null}
      </SiteContainer>
    </SiteHeaderShell>
  );
}
