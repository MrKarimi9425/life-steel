import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import {
  FiArrowUpLeft,
  FiArrowUpRight,
  FiClock,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiPhoneCall,
} from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import type { ProductFilters } from "@/lib/api";
import { contactHref, type ContactInformation } from "@/lib/site-content";

type SiteFooterProps = {
  locale: string;
  categories: ProductFilters["categories"];
  contacts: ContactInformation[];
};

type DirectContactInformation = ContactInformation & {
  type: Exclude<ContactInformation["type"], "LINK">;
};

type FooterCopy = {
  brandDescription: string;
  quickLinks: string;
  categories: string;
  contact: string;
  allProducts: string;
  emptyContact: string;
  copyright: string;
  links: Array<{ label: string; path: string }>;
};

const copy: Record<"fa" | "en" | "ar", FooterCopy> = {
  fa: {
    brandDescription:
      "تولید تخصصی حوله خشک کن و رادیاتور استیل با تمرکز بر دوام، زیبایی و کیفیت ساخت.",
    quickLinks: "دسترسی سریع",
    categories: "دسته بندی محصولات",
    contact: "راه های ارتباطی",
    allProducts: "مشاهده همه محصولات",
    emptyContact: "اطلاعات تماس به زودی تکمیل میشود.",
    copyright: "تمام حقوق برای لایف استیل محفوظ است.",
    links: [
      { label: "خانه", path: "" },
      { label: "محصولات", path: "/products" },
      { label: "وبلاگ", path: "/blog" },
      { label: "درباره ما", path: "/about" },
      { label: "تماس با ما", path: "/contact" },
    ],
  },
  en: {
    brandDescription:
      "Specialized stainless steel radiators and towel warmers, made for lasting quality and refined spaces.",
    quickLinks: "Quick links",
    categories: "Product categories",
    contact: "Contact details",
    allProducts: "View all products",
    emptyContact: "Contact details will be available soon.",
    copyright: "All rights reserved by Life Steel.",
    links: [
      { label: "Home", path: "" },
      { label: "Products", path: "/products" },
      { label: "Blog", path: "/blog" },
      { label: "About us", path: "/about" },
      { label: "Contact us", path: "/contact" },
    ],
  },
  ar: {
    brandDescription:
      "تصنيع متخصص لمشعات ومجففات مناشف من الفولاذ المقاوم للصدأ بجودة تدوم وتصميم أنيق.",
    quickLinks: "روابط سريعة",
    categories: "فئات المنتجات",
    contact: "معلومات الاتصال",
    allProducts: "عرض جميع المنتجات",
    emptyContact: "ستتم إضافة معلومات الاتصال قريبا.",
    copyright: "جميع الحقوق محفوظة للايف ستيل.",
    links: [
      { label: "الرئيسية", path: "" },
      { label: "المنتجات", path: "/products" },
      { label: "المدونة", path: "/blog" },
      { label: "من نحن", path: "/about" },
      { label: "اتصل بنا", path: "/contact" },
    ],
  },
};

const contactIcons: Record<Exclude<ContactInformation["type"], "LINK">, IconType> = {
  PHONE: FiPhoneCall,
  EMAIL: FiMail,
  ADDRESS: FiMapPin,
  HOURS: FiClock,
};

function socialIcon(value: string): IconType {
  const hostname = (() => {
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (hostname.includes("instagram")) return FaInstagram;
  if (hostname.includes("telegram") || hostname === "t.me") return FaTelegramPlane;
  if (hostname.includes("whatsapp") || hostname === "wa.me") return FaWhatsapp;
  return FiExternalLink;
}

function isDirectContact(item: ContactInformation): item is DirectContactInformation {
  return item.type !== "LINK";
}

function FooterHeading({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <h2 className="mb-5 flex items-center gap-2.5 text-base font-black text-content-inverse">
      <span className="h-5 w-1 rounded-full bg-brand" aria-hidden="true" />
      {children}
    </h2>
  );
}

export function SiteFooter({ locale, categories, contacts }: SiteFooterProps) {
  const localeCopy = copy[locale as keyof typeof copy] ?? copy.en;
  const isRtl = locale === "fa" || locale === "ar";
  const ArrowIcon = isRtl ? FiArrowUpLeft : FiArrowUpRight;
  const socialLinks = contacts.filter((item) => item.type === "LINK" && contactHref(item));
  const contactItems = contacts.filter(isDirectContact);

  return (
    <footer id="contact" className="mt-16 bg-surface-darker text-content-inverse-soft">
      <SiteContainer className="grid gap-x-10 gap-y-12 py-14 lg:grid-cols-[1.2fr_.75fr_.9fr_1.35fr] lg:py-16 md:grid-cols-2 max-[640px]:py-11">
        <div className="max-w-sm">
          <Link
            className="inline-flex items-center gap-3"
            href={`/${locale}`}
            aria-label="Life Steel"
          >
            <Image
              className="size-16 shrink-0 rounded-2xl bg-surface object-contain p-1"
              src="/life-steel-mark.png"
              alt=""
              width={72}
              height={72}
            />
            <span>
              <strong className="block font-[Arial,sans-serif] text-xl font-black tracking-[1px]">
                <span className="text-brand">LIFE</span>{" "}
                <span className="text-content-inverse">STEEL</span>
              </strong>
              <small className="mt-1 block text-[10px] font-medium text-content-inverse-soft/65">
                STAINLESS STEEL RADIATORS
              </small>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-content-inverse-soft/70">
            {localeCopy.brandDescription}
          </p>
          {socialLinks.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {socialLinks.map((item) => {
                const href = contactHref(item);
                const Icon = socialIcon(item.value);
                if (!href) return null;
                return (
                  <a
                    className="grid size-10 place-items-center rounded-xl border border-content-inverse/15 text-content-inverse-soft transition-[border-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand motion-reduce:transform-none motion-reduce:transition-none"
                    key={item.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.title}
                    title={item.title}
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <nav aria-label={localeCopy.quickLinks}>
          <FooterHeading>{localeCopy.quickLinks}</FooterHeading>
          <ul className="grid gap-3.5">
            {localeCopy.links.map((item) => (
              <li key={item.path || "home"}>
                <Link
                  className="group inline-flex items-center gap-2 text-sm font-bold text-content-inverse-soft/70 transition-colors hover:text-brand"
                  href={`/${locale}${item.path}`}
                >
                  <ArrowIcon
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={localeCopy.categories}>
          <FooterHeading>{localeCopy.categories}</FooterHeading>
          <ul className="grid gap-3.5">
            {categories.map((category) => {
              const title = category.translations[0]?.title;
              if (!title) return null;
              return (
                <li key={category.id}>
                  <Link
                    className="group inline-flex items-center gap-2 text-sm font-bold text-content-inverse-soft/70 transition-colors hover:text-brand"
                    href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
                  >
                    <ArrowIcon
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                    {title}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                className="inline-flex items-center gap-2 pt-1 text-sm font-black text-brand hover:text-brand-hover"
                href={`/${locale}/products`}
              >
                {localeCopy.allProducts}
                <ArrowIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <FooterHeading>{localeCopy.contact}</FooterHeading>
          {contactItems.length > 0 ? (
            <ul className="grid gap-4">
              {contactItems.map((item) => {
                const Icon = contactIcons[item.type];
                const href = contactHref(item);
                const content = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-content-inverse/7 text-brand">
                      <Icon className="size-[19px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <small className="mb-1 block text-[11px] font-bold text-content-inverse-soft/45">
                        {item.title}
                      </small>
                      <span
                        className="block text-sm leading-6 font-bold text-content-inverse-soft/80"
                        dir={item.type === "PHONE" || item.type === "EMAIL" ? "ltr" : undefined}
                      >
                        {item.value}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={item.id}>
                    {href ? (
                      <a className="group flex items-start gap-3 hover:text-brand" href={href}>
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-content-inverse-soft/60">
              {localeCopy.emptyContact}
            </p>
          )}
        </div>
      </SiteContainer>

      <div className="border-t border-content-inverse/10">
        <SiteContainer className="flex min-h-16 items-center justify-between gap-4 py-4 text-xs font-medium text-content-inverse-soft/50 max-[640px]:justify-center max-[640px]:text-center">
          <p>
            © {new Date().getFullYear()} Life Steel. {localeCopy.copyright}
          </p>
        </SiteContainer>
      </div>
    </footer>
  );
}
