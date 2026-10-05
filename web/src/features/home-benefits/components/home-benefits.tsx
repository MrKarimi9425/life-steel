import Image from "next/image";
import { SiteContainer } from "@/components/site-container";
import { RevealGroup, RevealItem } from "@/features/home-motion/components/home-motion";

type Benefit = {
  image: string;
  title: string;
  description: string;
};

const benefits: Record<string, Benefit[]> = {
  fa: [
    {
      image: "/images/benefits/variety.webp",
      title: "هماهنگ با فضای شما",
      description: "تنوع در مدل و رنگ",
    },
    {
      image: "/images/benefits/direct.webp",
      title: "از تولید کننده انتخاب کنید",
      description: "آشنایی مستقیم با محصولات",
    },
    {
      image: "/images/benefits/consultation.webp",
      title: "انتخاب با همراهی ما",
      description: "مشاوره پیش از انتخاب",
    },
  ],
  en: [
    {
      image: "/images/benefits/variety.webp",
      title: "Made for your space",
      description: "Models and colors to choose from",
    },
    {
      image: "/images/benefits/direct.webp",
      title: "Direct from the maker",
      description: "Get to know our products",
    },
    {
      image: "/images/benefits/consultation.webp",
      title: "Guidance when you need it",
      description: "Talk to us before choosing",
    },
  ],
  ar: [
    {
      image: "/images/benefits/variety.webp",
      title: "انسجام مع مساحتك",
      description: "تشكيلة من الطرازات والألوان",
    },
    {
      image: "/images/benefits/direct.webp",
      title: "اختر من المصنع",
      description: "تعرف على منتجاتنا مباشرة",
    },
    {
      image: "/images/benefits/consultation.webp",
      title: "نساعدك في الاختيار",
      description: "استشارة قبل الاختيار",
    },
  ],
};

export function HomeBenefits({ locale }: { locale: string }) {
  const items = benefits[locale] ?? benefits.en;

  return (
    <SiteContainer as="section" aria-label="Life Steel">
      <RevealGroup className="grid grid-cols-3 gap-4 max-[820px]:gap-3 max-[680px]:grid-cols-1">
        {items.map((benefit) => (
          <RevealItem className="h-full" key={benefit.title}>
            <article className="group flex min-h-36 items-center gap-5 overflow-hidden rounded-2xl border border-line px-5 py-4 transition-transform duration-500 ease-out hover:-translate-y-2 motion-reduce:transform-none motion-reduce:transition-none max-[1050px]:gap-3 max-[1050px]:px-4 max-[680px]:min-h-28">
              <Image
                src={benefit.image}
                alt=""
                width={112}
                height={112}
                className="size-24 shrink-0 object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transform-none motion-reduce:transition-none max-[1050px]:size-20 max-[680px]:size-[88px]"
              />
              <div className="min-w-0 transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
                <h2 className="text-base leading-7 font-extrabold text-content-strong max-[1050px]:text-sm">
                  {benefit.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-content-muted max-[1050px]:text-xs">
                  {benefit.description}
                </p>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </SiteContainer>
  );
}
