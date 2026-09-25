# Life Steel Backend

API نسخه دار NestJS با Prisma و MySQL. ماژول های فاز اول: `auth`، `admins`، `languages`، `media`، `catalog` و `dashboard`.

کپی `/.env.example` را به `/.env` در همین پوشه بسازید و مقدارهای واقعی اتصال دیتابیس، کلید JWT و مدیر اصلی را تنظیم کنید. سپس:

```powershell
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Seed را می توان دوباره اجرا کرد؛ ترجمه های عباراتی که از پنل ویرایش شده اند بازنویسی نمی شوند. فایل های آپلودی در مسیر `MEDIA_STORAGE_PATH` قرار می گیرند و باید در استقرار پایدار نگهداری شوند.

```powershell
npm run build
npm run lint
npm test -- --runInBand
```

API در `/api/v1` و مستندات آن در `/api/docs` ارائه می شود. فایل `.env` و داده های آپلودی نباید در مخزن ثبت شوند.
