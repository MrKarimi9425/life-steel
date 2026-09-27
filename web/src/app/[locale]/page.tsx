import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/api";
import { blogCopy } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFa = locale === "fa";
  const products = (await getProducts(locale, { pageSize: "6" })).items;

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">LIFE STEEL / STAINLESS HEATING</span>
          <h1>{isFa ? "گرمای ماندگار، با فرم دقیق استیل" : "Lasting warmth, shaped in stainless steel"}</h1>
          <p>{isFa ? "تولید تخصصی حوله خشک کن و رادیاتور استیل برای فضاهای معاصر؛ با تمرکز بر کیفیت ساخت، دوام و جزئیات." : "Specialized stainless steel radiators and towel warmers made for contemporary spaces."}</p>
          <div className="hero-actions"><Link className="button primary" href={`/${locale}/products`}>{isFa ? "مشاهده محصولات" : "Explore products"}</Link><Link className="button secondary" href={`/${locale}/blog`}>{blogCopy(locale).blog}</Link><a className="button secondary" href={`/${locale}/contact`}>{isFa ? "مشاوره و تماس" : "Contact us"}</a></div>
        </div>
        <div className="hero-visual"><div className="radiator-lines">{Array.from({ length: 7 }).map((_, index) => <span key={index} />)}</div><div className="steel-badge">304<br /><small>STAINLESS</small></div></div>
      </section>
      <section className="trust-strip"><span>{isFa ? "استیل با کیفیت" : "Quality steel"}</span><span>{isFa ? "ساخت دقیق" : "Precise build"}</span><span>{isFa ? "طراحی ماندگار" : "Timeless design"}</span><span>{isFa ? "پشتیبانی تخصصی" : "Expert support"}</span></section>
      <section className="section" id="products"><div className="section-heading"><div><span className="eyebrow">COLLECTION</span><h2>{isFa ? "محصولات منتخب" : "Featured products"}</h2></div><Link href={`/${locale}/products`}>{isFa ? "همه محصولات" : "All products"}</Link></div>
        {products.length > 0 ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : <div className="empty-state">{isFa ? "محصولات پس از ثبت در پنل، اینجا نمایش داده میشوند." : "Products will appear here after being added in the admin panel."}</div>}
      </section>
      <section className="about-section" id="about"><span className="eyebrow">LIFE STEEL</span><h2>{isFa ? "ساخته شده برای سال ها استفاده" : "Made for years of use"}</h2><p>{isFa ? "این نسخه موقت سایت است. متن، تصاویر و ساختار نهایی صفحه درباره ما در مرحله طراحی نهایی از پنل مدیریت تکمیل خواهد شد." : "This is the temporary website. Final brand content and visuals will be completed in the next design phase."}</p></section>
    </main>
  );
}
