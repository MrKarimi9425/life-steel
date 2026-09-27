# Life Steel

پروژه لایف استیل بر پایه ساختار `yaser_studio` و در سه برنامه مستقل ساخته شده است:

- `backend`: API با NestJS، Prisma و MySQL
- `admin`: پنل فارسی و راست به چپ با React و Vite
- `web`: سایت موقت چند زبانه با Next.js

## وضعیت فعلی

ورود مدیران، زبان ها، عبارت های رابط، دسته بندی ها، ویژگی ها، محصولات با قیمت رنگ ها و گالری اختصاصی، وبلاگ با ویرایشگر بلوکی، درباره ما، راه های ارتباطی، نقشه و پیام های فرم تماس پیاده سازی شده اند. پنل فارسی و راست چین است؛ جهت فیلدهای ترجمه از تنظیم زبان خوانده میشود. فروش آنلاین وجود ندارد و طراحی نهایی سایت هنوز مرحله بعدی است.

بخش محتوای سایت در پنل شامل مسیرهای `/site/about`، `/site/contacts` و `/site/messages` است. درباره ما گالری اختصاصی و SEO دارد و انتشار آن دستی است. راه های ارتباطی محدودیت تعداد ندارند و از نوع تلفن، ایمیل، نشانی، ساعت کاری یا لینک هستند. موقعیت با عرض و طول جغرافیایی تنظیم میشود؛ خالی بودن هر دو مختصات نقشه را مخفی میکند.

The localized `/{locale}/about` and `/{locale}/contact` pages use Neshan's Leaflet SDK. Configure `VITE_NESHAN_WEB_API_KEY` in `admin/.env.local` and `NEXT_PUBLIC_NESHAN_WEB_API_KEY` in `web/.env.local`; these files are ignored by Git. Example environment files contain no real keys. Web map keys are necessarily visible in client bundles: restrict permitted domains in Neshan's panel and maintain sufficient account credit. About content is edited directly on its admin page; its gallery has an independent dialog. Admin location selection uses map clicks rather than coordinate inputs. Desktop map links open Balad; Android uses `geo:` and iOS uses Apple Maps, with actual app handling determined by the device. Map attribution must remain visible. Define public contact-form rate limits before deployment.

## راه اندازی محلی

۱. MySQL را آماده کنید و مقادیر `backend/.env.example` را در فایل `backend/.env` با اطلاعات واقعی پر کنید. رمزها و اطلاعات اتصال را در Git ثبت نکنید.
۲. در `backend`، دستورهای `npm install`، `npx prisma migrate deploy` و `npm run prisma:seed` را اجرا کنید، سپس `npm run start:dev`.
۳. در `admin`، دستورهای `npm install` و `npm run dev` را اجرا کنید. آدرس پیش فرض پنل `http://localhost:5173` است.
۴. در `web`، دستورهای `npm install` و `npm run dev` را اجرا کنید. آدرس پیش فرض سایت `http://localhost:3001/fa` است.

در نخستین ورود، مدیر اصلی که از متغیرهای محیطی ساخته شده باید رمز موقت را عوض کند. بازنشانی رمز مدیران توسط مدیر اصلی در پنل انجام می شود و پیامک ارسال نمی شود.

## بررسی

در هر برنامه `npm run build` و `npm run lint` قابل اجرا است. تست های backend با `npm test -- --runInBand` اجرا می شوند. مستندات API پس از اجرای backend در `http://localhost:3000/api/docs` قرار دارد.

مهاجرت جدید محتوای سایت با `npx prisma migrate deploy` اعمال میشود. برای آزمون محلی، اطلاعات درباره ما، راه های تماس و مختصات را از پنل تکمیل کنید؛ اطلاعات واقعی در فایل نمونه محیطی قرار ندهید.
