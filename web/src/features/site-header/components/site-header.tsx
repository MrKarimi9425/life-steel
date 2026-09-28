import Image from "next/image";
import Link from "next/link";
import { FiExternalLink, FiGlobe, FiPhoneCall, FiSearch } from "react-icons/fi";
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
      <div className="mx-auto grid h-[104px] w-[calc(100%-40px)] max-w-[1115px] grid-cols-[190px_minmax(0,1fr)_344px] items-center gap-5 max-[1025px]:hidden">
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
            <strong className="block whitespace-nowrap font-[Arial,sans-serif] text-[19px] font-black tracking-[.8px] text-[#272d33]">
              LIFE STEEL
            </strong>
            <small className="mt-[3px] block whitespace-nowrap text-[9px] font-normal text-[#8a95a4]">
              {brandSubtitle}
            </small>
          </span>
        </Link>
        <form
          className="flex h-[66px] min-w-0 items-center rounded-[18px] border border-[#e6eaf1] bg-white focus-within:border-[#c2ceda] focus-within:shadow-[0_0_0_3px_#f2f5f8]"
          action={`/${locale}/products`}
          method="get"
          role="search"
        >
          <input
            className="h-full min-w-0 flex-1 border-0 bg-transparent ps-6 pe-2 text-[15px] text-[#303b48] outline-none placeholder:text-[#a0aec0]"
            name="search"
            type="search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
          />
          <button
            className="grid h-[58px] w-[58px] shrink-0 cursor-pointer place-items-center text-[#97a8c3] transition-colors hover:text-[#e57617]"
            type="submit"
            aria-label={isFa ? "جستجو" : locale === "ar" ? "بحث" : "Search"}
          >
            <FiSearch className="h-[26px] w-[26px]" aria-hidden="true" />
          </button>
        </form>
        <div className="flex items-center gap-[10px]" dir="ltr">
          <Link
            className="inline-flex h-[58px] w-[173px] items-center justify-center gap-[11px] whitespace-nowrap rounded-[18px] bg-[#f77910] text-base font-bold text-white shadow-[0_9px_18px_rgba(247,121,16,.13)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(15,23,42,.055)] motion-reduce:transition-none"
            href={contactPageHref}
          >
            <FiExternalLink className="h-6 w-6" aria-hidden="true" />
            <span>
              {isFa ? "مشاوره انتخاب" : locale === "ar" ? "استشارة الاختيار" : "Consultation"}
            </span>
          </Link>
          <details className="relative z-[3] shrink-0">
            <summary
              className="grid h-14 w-14 cursor-pointer list-none place-items-center rounded-[18px] bg-[#fff0e2] text-[#e57617] transition-[transform,filter] duration-200 hover:-translate-y-px hover:brightness-[.985] hover:saturate-[1.2] [&::-webkit-details-marker]:hidden"
              aria-label={languagesLabel}
              title={languagesLabel}
            >
              <FiGlobe className="h-[25px] w-[25px]" aria-hidden="true" />
            </summary>
            <div className="absolute top-[calc(100%+9px)] left-0 grid min-w-[90px] rounded-xl border border-[#e6ebf1] bg-white p-[5px] shadow-[0_12px_35px_rgba(32,45,62,.12)]">
              {languages.map((item) => (
                <Link
                  className="rounded-lg px-3 py-2 text-center text-xs font-extrabold text-[#6b7481] hover:bg-[#fff0e2] hover:text-[#c7640b] aria-[current=page]:bg-[#fff0e2] aria-[current=page]:text-[#c7640b]"
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
            className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#fff3eb] text-[#fa8548] transition-[transform,filter] duration-200 hover:-translate-y-px hover:brightness-[.985] motion-reduce:transition-none"
            href={phoneHref ?? contactPageHref}
            aria-label={contactLabel}
            title={contactLabel}
          >
            <FiPhoneCall className="h-[25px] w-[25px]" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div
        className={`site-header-menu-row mx-auto grid h-[68px] w-[calc(100%-40px)] max-w-[1115px] items-center gap-x-[14px] overflow-hidden border-t border-[#edf0f4] transition-[height,opacity,transform,visibility] duration-[240ms] max-[1025px]:hidden ${phoneHref ? "grid-cols-[209px_minmax(0,1fr)_150px]" : "grid-cols-[209px_minmax(0,1fr)]"}`}
      >
        <CategoryDropdown locale={locale} categories={categories} label={categoryLabel} />
        <SiteNavigation
          items={navigation}
          label={isFa ? "ناوبری اصلی" : "Main navigation"}
          variant="desktop"
        />
        {phone && phoneHref ? (
          <Link
            className="flex items-center justify-self-end gap-[9px] text-center text-[#9baac0] hover:text-[#e57617]"
            href={phoneHref}
          >
            <span className="order-2 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f5f9] text-[#9caabc]">
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
      </div>
    </SiteHeaderShell>
  );
}
