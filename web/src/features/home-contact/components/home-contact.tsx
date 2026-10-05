import Link from "next/link";
import { FiArrowUpLeft, FiArrowUpRight, FiPhoneCall } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import { homeSectionTitleClass } from "@/features/home-layout/home-layout.styles";

const labels = {
  fa: {
    eyebrow: "ارتباط با لایف استیل",
    title: "برای انتخاب مدل مناسب، کنارتان هستیم.",
    description: "درباره ابعاد، رنگ و تناسب محصول با فضای خود با ما صحبت کنید.",
    action: "دریافت مشاوره",
  },
  en: {
    eyebrow: "Contact Life Steel",
    title: "We can help you find the right model.",
    description: "Talk to us about dimensions, color and fit for your space.",
    action: "Get advice",
  },
  ar: {
    eyebrow: "تواصل مع لايف ستيل",
    title: "نساعدك في اختيار الطراز المناسب.",
    description: "تحدث إلينا عن الأبعاد واللون وملاءمة المنتج لمساحتك.",
    action: "احصل على استشارة",
  },
} as const;

const copyFor = (locale: string) => labels[locale as keyof typeof labels] ?? labels.en;

export function HomeContact({ locale }: { locale: string }) {
  const copy = copyFor(locale);
  const Arrow = locale === "en" ? FiArrowUpRight : FiArrowUpLeft;

  return (
    <SiteContainer as="section">
      <div className="relative isolate overflow-hidden rounded-[26px] bg-surface-darker px-8 py-9 text-content-inverse-soft max-[680px]:px-5 max-[680px]:py-7">
        <span
          className="pointer-events-none absolute -top-24 -end-12 -z-10 size-64 rounded-full border-[34px] border-brand/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-28 end-36 -z-10 size-52 rounded-full border-[28px] border-white/5 max-[680px]:hidden"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-brand"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-10 max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:gap-6">
          <div className="max-w-2xl">
            <span className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-wide text-brand">
              <FiPhoneCall size={16} aria-hidden="true" />
              {copy.eyebrow}
            </span>
            <h2 className={`m-0 text-content-inverse ${homeSectionTitleClass}`}>{copy.title}</h2>
            <p className="mt-2.5 mb-0 max-w-xl text-sm leading-7 text-content-dark-muted">
              {copy.description}
            </p>
          </div>

          <Link
            href={`/${locale}/contact`}
            className="group inline-flex min-h-13 shrink-0 items-center justify-center gap-3 rounded-xl bg-brand px-6 py-3 text-sm font-extrabold text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-brand-hover motion-reduce:transform-none motion-reduce:transition-none max-[680px]:w-full"
          >
            {copy.action}
            <Arrow
              size={18}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>
    </SiteContainer>
  );
}
