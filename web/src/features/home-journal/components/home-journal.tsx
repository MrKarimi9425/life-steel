import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { SiteContainer } from "@/components/site-container";
import { homeSectionTitleClass } from "@/features/home-layout/home-layout.styles";
import { RevealGroup, RevealItem } from "@/features/home-motion/components/home-motion";
import { mediaUrl } from "@/lib/api";
import type { BlogCardData } from "@/lib/blog";

const labels = {
  fa: {
    title: "آخرین مطالب وبلاگ",
    all: "همه مقالات",
    badge: "مقاله",
    read: "مطالعه مطلب",
    empty: "مقالات پس از انتشار در پنل، اینجا نمایش داده میشوند.",
  },
  en: {
    title: "Latest from the blog",
    all: "All articles",
    badge: "Article",
    read: "Read article",
    empty: "Published articles will appear here.",
  },
  ar: {
    title: "أحدث مقالات المدونة",
    all: "كل المقالات",
    badge: "مقال",
    read: "قراءة المقال",
    empty: "ستظهر المقالات هنا بعد نشرها.",
  },
} as const;

const copyFor = (locale: string) => labels[locale as keyof typeof labels] ?? labels.en;

function ArticleCard({ article, locale }: { article: BlogCardData; locale: string }) {
  const copy = copyFor(locale);
  const image = mediaUrl(article.cover?.path ?? null);
  const Arrow = locale === "en" ? FiArrowRight : FiArrowLeft;
  const arrowMotion = locale === "en" ? "group-hover:translate-x-1" : "group-hover:-translate-x-1";

  return (
    <Link
      href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <span className="relative mx-2.5 mt-2.5 block aspect-square overflow-hidden rounded-[12px] bg-media-warm text-media-warm-content">
        {image ? (
          <Image
            src={image}
            alt={article.cover?.translations[0]?.altText ?? article.title}
            fill
            sizes="(max-width: 430px) 100vw, (max-width: 680px) 50vw, (max-width: 900px) 33vw, (max-width: 1100px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-sans text-3xl font-black">
            LS
          </span>
        )}
        <span className="absolute top-2.5 end-2.5 rounded-[8px] bg-brand px-2.5 py-1 text-[10px] font-extrabold text-white">
          {copy.badge}
        </span>
      </span>

      <span className="flex flex-1 flex-col px-4 pt-3.5 pb-3 text-center">
        <strong className="line-clamp-2 min-h-12 text-[13px] leading-6 font-extrabold text-content-strong">
          {article.title}
        </strong>
        {article.summary && (
          <span className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-content-muted">
            {article.summary}
          </span>
        )}
        <span className="mt-auto flex items-center justify-center gap-1.5 pt-3 text-[11px] font-extrabold text-brand transition-colors group-hover:text-brand-hover">
          {copy.read}
          <Arrow
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-300 motion-reduce:transform-none motion-reduce:transition-none ${arrowMotion}`}
          />
        </span>
      </span>
    </Link>
  );
}

export function HomeJournal({ locale, articles }: { locale: string; articles: BlogCardData[] }) {
  const copy = copyFor(locale);
  const Arrow = locale === "en" ? FiArrowRight : FiArrowLeft;

  return (
    <SiteContainer as="section">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={`m-0 text-content-strong ${homeSectionTitleClass}`}>{copy.title}</h2>
        <Link
          href={`/${locale}/blog`}
          className="flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-content-strong transition-colors hover:text-brand"
        >
          {copy.all}
          <Arrow size={14} aria-hidden="true" />
        </Link>
      </div>

      {articles.length ? (
        <RevealGroup className="grid grid-cols-5 gap-4 max-[1100px]:grid-cols-4 max-[900px]:grid-cols-3 max-[680px]:grid-cols-2 max-[430px]:grid-cols-1">
          {articles.slice(0, 5).map((article) => (
            <RevealItem className="h-full" key={article.id}>
              <ArticleCard locale={locale} article={article} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="rounded-2xl border border-line bg-surface px-5 py-12 text-center text-sm text-content-muted">
          {copy.empty}
        </p>
      )}
    </SiteContainer>
  );
}
