import Link from "next/link";

export default function NotFound() {
  return <html lang="fa" dir="rtl"><body><main className="not-found"><span className="brand-mark">LS</span><h1>صفحه پیدا نشد</h1><p>آدرس مورد نظر وجود ندارد یا محتوا هنوز منتشر نشده است.</p><Link className="button primary" href="/fa">بازگشت به خانه</Link></main></body></html>;
}
