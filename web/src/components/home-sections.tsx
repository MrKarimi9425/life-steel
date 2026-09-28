import Image from "next/image";
import Link from "next/link";
import { mediaUrl, type ProductCardData, type ProductFilters } from "@/lib/api";
import { type BlogCardData } from "@/lib/blog";
import { pricingText } from "@/lib/product-pricing";

const labels = {
  fa: {
    eyebrow: "گرما، در زیباترین شکل آن",
    hero: "جزئیاتی که فضای شما را متفاوت میکنند.",
    intro: "مجموعه رادیاتورهای استیل و حوله خشک کن ها؛ هماهنگ با معماری و سلیقه شما.",
    products: "محصولات",
    discover: "کشف محصولات",
    consult: "مشاوره انتخاب",
    benefit: [
      ["هماهنگ با فضای شما", "تنوع در مدل و رنگ"],
      ["از تولید کننده انتخاب کنید", "آشنایی مستقیم با محصولات"],
      ["انتخاب با همراهی ما", "مشاوره پیش از انتخاب"],
    ],
    selected: "برای هر فضا، یک انتخاب",
    selectedSub: "مدل های منتخب لایف استیل",
    all: "همه محصولات",
    detail: "مشاهده مدل",
    emptyProducts: "محصولات پس از انتشار در پنل، اینجا نمایش داده میشوند.",
    story1: "هماهنگی، از جزئیات شروع میشود.",
    story1Text: "رنگ محصول را کنار متریال و سبک فضای خود انتخاب کنید.",
    story2: "نگاهی نزدیک تر به آنچه میسازیم.",
    story2Text: "با محصولات و مسیر تولید لایف استیل آشنا شوید.",
    about: "درباره ما",
    journal: "مجله لایف استیل",
    journalSub: "برای انتخابی آگاهانه تر",
    allArticles: "همه مقالات",
    emptyArticles: "مقالات پس از انتشار در پنل، اینجا نمایش داده میشوند.",
    contact: "ارتباط با لایف استیل",
    contactTitle: "برای انتخاب مدل مناسب، کنارتان هستیم.",
    contactText: "درباره ابعاد، رنگ و تناسب محصول با فضای خود با ما صحبت کنید.",
  },
  en: {
    eyebrow: "Warmth, in its finest form",
    hero: "Details that make your space different.",
    intro: "Stainless steel radiators and towel warmers designed to complement your space.",
    products: "Products",
    discover: "Explore products",
    consult: "Get in touch",
    benefit: [
      ["Made for your space", "Models and colors to choose from"],
      ["Direct from the maker", "Get to know our products"],
      ["Guidance when you need it", "Talk to us before choosing"],
    ],
    selected: "A choice for every space",
    selectedSub: "Selected Life Steel models",
    all: "All products",
    detail: "View model",
    emptyProducts: "Published products will appear here.",
    story1: "Harmony begins with the details.",
    story1Text: "Choose a finish that works with your space.",
    story2: "A closer look at what we make.",
    story2Text: "Explore Life Steel and our products.",
    about: "About us",
    journal: "Life Steel journal",
    journalSub: "Ideas for an informed choice",
    allArticles: "All articles",
    emptyArticles: "Published articles will appear here.",
    contact: "Contact Life Steel",
    contactTitle: "We can help you find the right model.",
    contactText: "Talk to us about dimensions, color and fit for your space.",
  },
  ar: {
    eyebrow: "الدفء في أجمل صوره",
    hero: "تفاصيل تجعل مساحتك مختلفة.",
    intro: "مشعات من الفولاذ المقاوم للصدأ ومجففات مناشف تنسجم مع تصميم مساحتك.",
    products: "المنتجات",
    discover: "اكتشف المنتجات",
    consult: "تواصل معنا",
    benefit: [
      ["انسجام مع مساحتك", "تشكيلة من الطرازات والألوان"],
      ["اختر من المصنع", "تعرف على منتجاتنا مباشرة"],
      ["نساعدك في الاختيار", "استشارة قبل الاختيار"],
    ],
    selected: "اختيار لكل مساحة",
    selectedSub: "منتجات مختارة من لايف ستيل",
    all: "كل المنتجات",
    detail: "عرض المنتج",
    emptyProducts: "ستظهر المنتجات هنا بعد نشرها.",
    story1: "الانسجام يبدأ من التفاصيل.",
    story1Text: "اختر اللون المناسب لتصميم مساحتك.",
    story2: "نظرة أقرب إلى ما نصنعه.",
    story2Text: "تعرف على منتجات لايف ستيل.",
    about: "من نحن",
    journal: "مجلة لايف ستيل",
    journalSub: "أفكار تساعدك على الاختيار",
    allArticles: "كل المقالات",
    emptyArticles: "ستظهر المقالات هنا بعد نشرها.",
    contact: "تواصل مع لايف ستيل",
    contactTitle: "نساعدك في اختيار الطراز المناسب.",
    contactText: "تحدث إلينا عن الأبعاد واللون وملاءمة المنتج لمساحتك.",
  },
} as const;
const t = (locale: string) => labels[locale as keyof typeof labels] ?? labels.en;

function Rail({ black = false }: { black?: boolean }) {
  return (
    <div className={`home-rail${black ? " home-rail-dark" : ""}`} aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

function Heading({
  title,
  subtitle,
  href,
  link,
}: {
  title: string;
  subtitle: string;
  href: string;
  link: string;
}) {
  return (
    <div className="home-heading">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link href={href}>
        {link} <span aria-hidden="true">←</span>
      </Link>
    </div>
  );
}

export function HomeCategories({
  locale,
  categories,
  products,
}: {
  locale: string;
  categories: ProductFilters["categories"];
  products: ProductCardData[];
}) {
  if (!categories.length) return null;
  return (
    <nav className="home-container home-categories" aria-label={t(locale).products}>
      {categories.slice(0, 5).map((category) => {
        const translation = category.translations[0];
        if (!translation) return null;
        const cover = products.find(
          (product) =>
            product.isFeatured &&
            product.categories.some(
              (entry) => entry.category.translations[0]?.slug === translation.slug,
            ),
        )?.coverMedia;
        const src = mediaUrl(cover?.path ?? null);
        return (
          <Link
            className="home-category"
            href={`/${locale}/products?categoryId=${encodeURIComponent(category.id)}`}
            key={category.id}
          >
            <span className="home-category-image">
              {src ? (
                <Image src={src} alt="" fill sizes="120px" />
              ) : (
                <span className="home-category-placeholder" aria-hidden="true">
                  LS
                </span>
              )}
            </span>
            <span>{translation.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function HomeHero({
  locale,
  featured,
}: {
  locale: string;
  featured: ProductCardData | null;
}) {
  const c = t(locale);
  const image = mediaUrl(featured?.coverMedia?.path ?? null);
  const featuredTitle = featured?.translations[0]?.title;
  return (
    <section className="home-container home-hero">
      <div className="home-hero-copy">
        <span className="home-eyebrow">{c.eyebrow}</span>
        <h1>{c.hero}</h1>
        <p>{c.intro}</p>
        {featuredTitle && <span className="home-hero-featured">{featuredTitle}</span>}
        <div className="home-actions">
          <Link
            className="home-button"
            href={
              featured?.translations[0]
                ? `/${locale}/products/${encodeURIComponent(featured.translations[0].slug)}`
                : `/${locale}/products`
            }
          >
            {c.discover} ←
          </Link>
          <Link className="home-button home-button-outline" href={`/${locale}/contact`}>
            {c.consult}
          </Link>
        </div>
      </div>
      <div className="home-hero-image">
        {image ? (
          <Image
            src={image}
            alt={featured?.coverMedia?.translations[0]?.altText ?? featuredTitle ?? ""}
            fill
            priority
            sizes="(max-width: 680px) 100vw, 50vw"
          />
        ) : (
          <Rail />
        )}
        <span className="home-room-tag">LIFE STEEL</span>
      </div>
    </section>
  );
}

export function HomeBenefits({ locale }: { locale: string }) {
  return (
    <section className="home-container home-benefits" aria-label="Life Steel">
      {t(locale).benefit.map(([title, subtitle], i) => (
        <div className="home-benefit" key={title}>
          <span className="home-benefit-icon" aria-hidden="true">
            {["✦", "◇", "↗"][i]}
          </span>
          <div>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

export function HomeProducts({
  locale,
  products,
}: {
  locale: string;
  products: ProductCardData[];
}) {
  const c = t(locale);
  return (
    <section className="home-container home-products">
      <div className="home-product-showcase">
        <div className="home-product-showcase-intro">
          <span className="home-eyebrow">LIFE STEEL</span>
          <h2>{c.selected}</h2>
          <p>{c.selectedSub}</p>
          <Link href={`/${locale}/products`}>{c.all} ←</Link>
        </div>
        {products.length ? (
          <div className="home-product-grid">
            {products.slice(0, 3).map((product) => {
              const translation = product.translations[0];
              if (!translation) return null;
              const src = mediaUrl(product.coverMedia?.path ?? null);
              const category = product.categories.find((entry) => entry.isPrimary)?.category
                .translations[0]?.title;
              return (
                <Link
                  className="home-product-card"
                  href={`/${locale}/products/${encodeURIComponent(translation.slug)}`}
                  key={product.id}
                >
                  <div className="home-product-image">
                    {src ? (
                      <Image
                        src={src}
                        alt={product.coverMedia?.translations[0]?.altText ?? translation.title}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 950px) 50vw, 33vw"
                      />
                    ) : (
                      <Rail black={product.id.charCodeAt(0) % 2 === 0} />
                    )}
                    {category && <span className="home-product-badge">{category}</span>}
                  </div>
                  <div className="home-product-body">
                    <h3>{translation.title}</h3>
                    {translation.summary && <p>{translation.summary}</p>}
                    <div className="home-product-bottom">
                      <span>{product.pricing ? pricingText(product.pricing, locale) : ""}</span>
                      <strong>{c.detail} ←</strong>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="home-empty">{c.emptyProducts}</p>
        )}
      </div>
    </section>
  );
}

export function HomeFeatured({
  locale,
  product,
}: {
  locale: string;
  product: ProductCardData | null;
}) {
  const translation = product?.translations[0];
  if (!product || !translation) return null;
  const image = product.isFeatured ? mediaUrl(product.coverMedia?.path ?? null) : null;
  return (
    <section className="home-container home-featured" aria-label={translation.title}>
      <div className="home-featured-main">
        <div className="home-featured-visual">
          {image ? (
            <Image
              src={image}
              alt={product.coverMedia?.translations[0]?.altText ?? translation.title}
              fill
              sizes="(max-width: 700px) 100vw, 33vw"
            />
          ) : (
            <Rail />
          )}
        </div>
        <div className="home-featured-copy">
          <span className="home-eyebrow">LIFE STEEL</span>
          <h2>{translation.title}</h2>
          {translation.summary && <p>{translation.summary}</p>}
          <div className="home-featured-pricing">
            {product.pricing && pricingText(product.pricing, locale)}
          </div>
          <Link
            className="home-button"
            href={`/${locale}/products/${encodeURIComponent(translation.slug)}`}
          >
            {t(locale).detail} ←
          </Link>
        </div>
      </div>
      <div className="home-featured-side">
        <span className="home-featured-side-mark" aria-hidden="true">
          LS
        </span>
        <strong>{t(locale).story2}</strong>
        <Link href={`/${locale}/about`}>{t(locale).about} ←</Link>
      </div>
    </section>
  );
}

export function HomeStories({
  locale,
  aboutTitle,
  products,
}: {
  locale: string;
  aboutTitle: string | null;
  products: ProductCardData[];
}) {
  const c = t(locale);
  const featured = products.filter((product) => product.isFeatured);
  const firstImage = mediaUrl(featured[0]?.coverMedia?.path ?? null);
  const secondImage = mediaUrl(featured[1]?.coverMedia?.path ?? null);
  return (
    <section className="home-container home-stories">
      <Link href={`/${locale}/products`} className="home-story home-story-light">
        <span className="home-story-copy">
          <span className="home-eyebrow">{c.products}</span>
          <h2>{c.story1}</h2>
          <p>{c.story1Text}</p>
          <strong>{c.discover} ←</strong>
        </span>
        {firstImage && (
          <span className="home-story-image">
            <Image src={firstImage} alt="" fill sizes="300px" />
          </span>
        )}
      </Link>
      <Link href={`/${locale}/about`} className="home-story home-story-dark">
        <span className="home-story-copy">
          <span className="home-eyebrow">LIFE STEEL</span>
          <h2>{aboutTitle ?? c.story2}</h2>
          <p>{c.story2Text}</p>
          <strong>{c.about} ←</strong>
        </span>
        {secondImage ? (
          <span className="home-story-image">
            <Image src={secondImage} alt="" fill sizes="300px" />
          </span>
        ) : (
          <span className="home-story-monogram" aria-hidden="true">
            LS
          </span>
        )}
      </Link>
    </section>
  );
}

function ArticleCard({
  locale,
  article,
  featured = false,
}: {
  locale: string;
  article: BlogCardData;
  featured?: boolean;
}) {
  const src = mediaUrl(article.cover?.path ?? null);
  return (
    <Link
      className={featured ? "home-article-featured" : "home-article-row"}
      href={`/${locale}/blog/${encodeURIComponent(article.slug)}`}
    >
      <span className="home-article-image">
        {src ? (
          <Image
            src={src}
            alt={article.cover?.translations[0]?.altText ?? article.title}
            fill
            sizes={featured ? "(max-width: 680px) 100vw, 50vw" : "120px"}
          />
        ) : (
          <span aria-hidden="true">LS</span>
        )}
      </span>
      <span className="home-article-copy">
        <strong>{article.title}</strong>
        {article.summary && <small>{article.summary}</small>}
      </span>
    </Link>
  );
}

export function HomeJournal({ locale, articles }: { locale: string; articles: BlogCardData[] }) {
  const c = t(locale);
  return (
    <section className="home-container home-journal">
      <Heading
        title={c.journal}
        subtitle={c.journalSub}
        href={`/${locale}/blog`}
        link={c.allArticles}
      />
      {articles.length ? (
        <div className={`home-journal-grid${articles.length === 1 ? " home-journal-single" : ""}`}>
          <ArticleCard locale={locale} article={articles[0]} featured />
          {articles.length > 1 && (
            <div className="home-journal-list">
              {articles.slice(1, 4).map((article) => (
                <ArticleCard key={article.id} locale={locale} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="home-empty">{c.emptyArticles}</p>
      )}
    </section>
  );
}

export function HomeContact({ locale }: { locale: string }) {
  const c = t(locale);
  return (
    <section className="home-container home-contact">
      <div>
        <h2>{c.contactTitle}</h2>
        <p>{c.contactText}</p>
      </div>
      <Link className="home-button" href={`/${locale}/contact`}>
        {c.contact} ↗
      </Link>
    </section>
  );
}
