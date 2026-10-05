import 'dotenv/config';

import { mkdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hash } from 'argon2';
import {
  AttributeType,
  ContentStatus,
  HomeSectionType,
  MediaKind,
  MediaProcessingStatus,
  MediaSource,
  MediaVariantKind,
  PrismaClient,
  SiteSectionPage,
  TextDirection,
  TranslationStatus,
} from '../src/generated/prisma/client';
import { normalizePhoneNumber } from '../src/common/utils/phone-number.util';

const sampleIds = {
  media: 'seed_life_steel_media',
  ariaMedia: [
    'seed_product_aria_media_front',
    'seed_product_aria_media_black',
    'seed_product_aria_media_gold',
    'seed_product_aria_media_detail',
  ],
  categories: [
    'seed_category_towel_warmers',
    'seed_category_radiators',
    'seed_category_accessories',
  ],
  attributes: [
    'seed_attribute_model',
    'seed_attribute_description',
    'seed_attribute_width',
    'seed_attribute_wall_mounted',
    'seed_attribute_material',
    'seed_attribute_finish',
    'seed_attribute_colors',
  ],
  products: [
    'seed_product_towel_warmer',
    'seed_product_radiator',
    'seed_product_accessory',
    'seed_product_towel_warmer_soren',
    'seed_product_towel_warmer_ava',
    'seed_product_radiator_roya',
    'seed_product_radiator_saba',
    'seed_product_towel_warmer_dena',
  ],
} as const;

const optionIds = {
  steel304: 'seed_option_steel_304',
  steel316: 'seed_option_steel_316',
  chrome: 'seed_option_chrome',
  brushed: 'seed_option_brushed',
  black: 'seed_option_black',
  gold: 'seed_option_gold',
  silver: 'seed_option_silver',
} as const;

const phrases = [
  ['common.home', 'خانه', 'Home'],
  ['common.products', 'محصولات', 'Products'],
  ['common.projects', 'پروژه ها', 'Projects'],
  ['common.blog', 'وبلاگ', 'Blog'],
  ['common.about', 'درباره ما', 'About us'],
  ['common.contact', 'تماس با ما', 'Contact us'],
  ['common.search', 'جستجو', 'Search'],
  ['product.related', 'محصولات مرتبط', 'Related products'],
  ['product.specifications', 'مشخصات فنی', 'Specifications'],
] as const;

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#172033"/><stop offset="1" stop-color="#46546d"/></linearGradient></defs>
  <rect width="1200" height="800" fill="url(#g)"/><rect x="360" y="120" width="480" height="560" rx="28" fill="none" stroke="#d7dde8" stroke-width="18"/>
  <path d="M440 180v440M520 180v440M600 180v440M680 180v440M760 180v440" stroke="#d7dde8" stroke-width="20" stroke-linecap="round"/>
  <text x="600" y="750" fill="#fff" font-family="Arial,sans-serif" font-size="34" text-anchor="middle">LIFE STEEL - SAMPLE</text>
</svg>`;

function createProductGallerySvg({
  backgroundStart,
  backgroundEnd,
  metal,
  accent,
  rotation,
  label,
}: {
  backgroundStart: string;
  backgroundEnd: string;
  metal: string;
  accent: string;
  rotation: number;
  label: string;
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${backgroundStart}"/><stop offset="1" stop-color="${backgroundEnd}"/></linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${metal}"/><stop offset=".5" stop-color="#f8fafc"/><stop offset="1" stop-color="${metal}"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="40" stdDeviation="35" flood-color="#111827" flood-opacity=".22"/></filter>
  </defs>
  <rect width="1600" height="1600" fill="url(#background)"/>
  <circle cx="1320" cy="250" r="250" fill="${accent}" opacity=".12"/>
  <circle cx="230" cy="1330" r="330" fill="${accent}" opacity=".08"/>
  <g transform="translate(800 760) rotate(${rotation})" filter="url(#shadow)">
    <rect x="-410" y="-520" width="820" height="1040" rx="58" fill="none" stroke="${metal}" stroke-width="34"/>
    <g stroke="url(#metal)" stroke-width="54" stroke-linecap="round">
      <path d="M-300-390h600"/><path d="M-300-230h600"/><path d="M-300-70h600"/><path d="M-300 90h600"/><path d="M-300 250h600"/><path d="M-300 410h600"/>
    </g>
    <circle cx="-410" cy="-410" r="25" fill="${accent}"/><circle cx="410" cy="410" r="25" fill="${accent}"/>
  </g>
  <rect x="560" y="1390" width="480" height="6" rx="3" fill="${accent}"/>
  <text x="800" y="1470" fill="#111827" font-family="Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle" letter-spacing="8">${label}</text>
</svg>`;
}

const ariaGalleryMedia = [
  {
    id: sampleIds.ariaMedia[0],
    fileName: 'aria-front.svg',
    faTitle: 'نمای روبروی حوله خشک کن آریا',
    enTitle: 'Aria towel warmer front view',
    faAlt: 'نمای روبروی حوله خشک کن استیل مدل آریا',
    enAlt: 'Front view of the Aria stainless steel towel warmer',
    svg: createProductGallerySvg({
      backgroundStart: '#f8fafc',
      backgroundEnd: '#e5e7eb',
      metal: '#202124',
      accent: '#ff7900',
      rotation: 0,
      label: 'ARIA / FRONT',
    }),
  },
  {
    id: sampleIds.ariaMedia[1],
    fileName: 'aria-black.svg',
    faTitle: 'نمای زاویه دار رنگ مشکی آریا',
    enTitle: 'Aria black angled view',
    faAlt: 'حوله خشک کن آریا با رنگ مشکی از نمای زاویه دار',
    enAlt: 'Angled view of the Aria towel warmer in black',
    svg: createProductGallerySvg({
      backgroundStart: '#e8eaed',
      backgroundEnd: '#b9bec5',
      metal: '#171717',
      accent: '#ff7900',
      rotation: -7,
      label: 'ARIA / BLACK',
    }),
  },
  {
    id: sampleIds.ariaMedia[2],
    fileName: 'aria-gold.svg',
    faTitle: 'نمای رنگ طلایی آریا',
    enTitle: 'Aria gold view',
    faAlt: 'حوله خشک کن آریا با پوشش طلایی',
    enAlt: 'Aria towel warmer with a gold finish',
    svg: createProductGallerySvg({
      backgroundStart: '#fffaf0',
      backgroundEnd: '#ead7b7',
      metal: '#c7a04a',
      accent: '#ff7900',
      rotation: 6,
      label: 'ARIA / GOLD',
    }),
  },
  {
    id: sampleIds.ariaMedia[3],
    fileName: 'aria-detail.svg',
    faTitle: 'نمای جزئیات اتصالات آریا',
    enTitle: 'Aria connection detail',
    faAlt: 'نمای نزدیک جزئیات و اتصالات حوله خشک کن آریا',
    enAlt: 'Close view of the Aria towel warmer details and connections',
    svg: createProductGallerySvg({
      backgroundStart: '#f3f4f6',
      backgroundEnd: '#d1d5db',
      metal: '#9ca3af',
      accent: '#202124',
      rotation: -3,
      label: 'ARIA / DETAIL',
    }),
  },
] as const;

async function prepareSampleMedia(): Promise<
  Array<{ path: string; size: bigint }>
> {
  const storageRoot = resolve(
    process.cwd(),
    process.env.MEDIA_STORAGE_PATH ?? 'storage/media',
  );
  const directory = resolve(storageRoot, 'seed-life-steel');
  await mkdir(directory, { recursive: true });
  const files = [
    { path: 'seed-life-steel/sample.svg', svg: sampleSvg },
    ...ariaGalleryMedia.map((media) => ({
      path: `seed-life-steel/${media.fileName}`,
      svg: media.svg,
    })),
  ];
  return Promise.all(
    files.map(async (file) => {
      const absolutePath = resolve(storageRoot, file.path);
      await writeFile(absolutePath, file.svg, 'utf8');
      return { path: file.path, size: BigInt((await stat(absolutePath)).size) };
    }),
  );
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  const ownerPassword = process.env.OWNER_TEMPORARY_PASSWORD;
  const ownerFirstName = process.env.OWNER_FIRST_NAME;
  const ownerLastName = process.env.OWNER_LAST_NAME;

  if (
    !databaseUrl ||
    !ownerPhone ||
    !ownerPassword ||
    !ownerFirstName ||
    !ownerLastName
  ) {
    throw new Error(
      'Database and owner seed environment variables are required.',
    );
  }

  const preparedMediaFiles = await prepareSampleMedia();
  const mediaFile = preparedMediaFiles[0]!;
  const ariaMediaFiles = preparedMediaFiles.slice(1);
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });

  try {
    await prisma.$transaction(
      async (tx) => {
        const fa = await tx.language.upsert({
          where: { code: 'fa' },
          create: {
            code: 'fa',
            name: 'فارسی',
            nativeName: 'فارسی',
            direction: TextDirection.RTL,
            isDefault: true,
            isActive: true,
            isRequiredForPublish: true,
            displayOrder: 1,
          },
          update: {},
        });
        const en = await tx.language.upsert({
          where: { code: 'en' },
          create: {
            code: 'en',
            name: 'انگلیسی',
            nativeName: 'English',
            direction: TextDirection.LTR,
            isActive: true,
            displayOrder: 2,
          },
          update: {},
        });

        for (const [key, faValue, enValue] of phrases) {
          const phrase = await tx.interfacePhrase.upsert({
            where: { namespace_key: { namespace: 'website', key } },
            create: {
              namespace: 'website',
              key,
              description: `عبارت آزمایشی ${key}`,
            },
            update: {},
          });
          await tx.interfacePhraseTranslation.createMany({
            data: [
              { phraseId: phrase.id, languageId: fa.id, value: faValue },
              { phraseId: phrase.id, languageId: en.id, value: enValue },
            ],
            skipDuplicates: true,
          });
        }

        await tx.homeSection.upsert({
          where: { id: 'products_banner' },
          create: {
            id: 'products_banner',
            page: SiteSectionPage.PRODUCTS,
            type: HomeSectionType.BANNER_FULL,
            title: 'بنر صفحه محصولات',
            isActive: true,
            displayOrder: 0,
          },
          update: {
            page: SiteSectionPage.PRODUCTS,
            type: HomeSectionType.BANNER_FULL,
            title: 'بنر صفحه محصولات',
            isActive: true,
          },
        });

        await tx.homeSection.upsert({
          where: { id: 'blog_banner' },
          create: {
            id: 'blog_banner',
            page: SiteSectionPage.BLOG,
            type: HomeSectionType.BANNER_FULL,
            title: 'بنر صفحه وبلاگ',
            isActive: true,
            displayOrder: 0,
          },
          update: {
            page: SiteSectionPage.BLOG,
            type: HomeSectionType.BANNER_FULL,
            title: 'بنر صفحه وبلاگ',
            isActive: true,
          },
        });

        await tx.product.deleteMany({
          where: { id: { in: [...sampleIds.products] } },
        });
        await tx.productCategory.deleteMany({
          where: { id: { in: [...sampleIds.categories] } },
        });
        await tx.attributeDefinition.deleteMany({
          where: { id: { in: [...sampleIds.attributes] } },
        });
        await tx.mediaAsset.deleteMany({
          where: { id: { in: [sampleIds.media, ...sampleIds.ariaMedia] } },
        });

        await tx.mediaAsset.create({
          data: {
            id: sampleIds.media,
            kind: MediaKind.IMAGE,
            source: MediaSource.UPLOAD,
            path: mediaFile.path,
            originalFileName: 'life-steel-sample.svg',
            mimeType: 'image/svg+xml',
            sizeBytes: mediaFile.size,
            width: 1200,
            height: 800,
            processingStatus: MediaProcessingStatus.READY,
            variants: {
              create: [
                {
                  kind: MediaVariantKind.THUMBNAIL,
                  path: mediaFile.path,
                  mimeType: 'image/svg+xml',
                  sizeBytes: mediaFile.size,
                  width: 320,
                  height: 213,
                },
                {
                  kind: MediaVariantKind.CARD,
                  path: mediaFile.path,
                  mimeType: 'image/svg+xml',
                  sizeBytes: mediaFile.size,
                  width: 900,
                  height: 600,
                },
                {
                  kind: MediaVariantKind.LARGE,
                  path: mediaFile.path,
                  mimeType: 'image/svg+xml',
                  sizeBytes: mediaFile.size,
                  width: 1200,
                  height: 800,
                },
                {
                  kind: MediaVariantKind.OPTIMIZED,
                  path: mediaFile.path,
                  mimeType: 'image/svg+xml',
                  sizeBytes: mediaFile.size,
                  width: 1200,
                  height: 800,
                },
              ],
            },
            translations: {
              create: [
                {
                  languageId: fa.id,
                  title: 'تصویر آزمایشی محصول',
                  altText: 'نمونه آزمایشی حوله خشک کن استیل',
                  caption: 'این تصویر فقط برای تست پنل استفاده شده است.',
                },
                {
                  languageId: en.id,
                  title: 'Sample product image',
                  altText: 'Sample stainless steel towel warmer',
                  caption: 'This image is used only for admin panel testing.',
                },
              ],
            },
          },
        });

        for (const [index, media] of ariaGalleryMedia.entries()) {
          const file = ariaMediaFiles[index]!;
          await tx.mediaAsset.create({
            data: {
              id: media.id,
              kind: MediaKind.IMAGE,
              source: MediaSource.UPLOAD,
              path: file.path,
              originalFileName: media.fileName,
              mimeType: 'image/svg+xml',
              sizeBytes: file.size,
              width: 1600,
              height: 1600,
              processingStatus: MediaProcessingStatus.READY,
              variants: {
                create: [
                  [MediaVariantKind.THUMBNAIL, 320],
                  [MediaVariantKind.CARD, 900],
                  [MediaVariantKind.LARGE, 1600],
                  [MediaVariantKind.OPTIMIZED, 1600],
                ].map(([kind, size]) => ({
                  kind: kind as MediaVariantKind,
                  path: file.path,
                  mimeType: 'image/svg+xml',
                  sizeBytes: file.size,
                  width: size as number,
                  height: size as number,
                })),
              },
              translations: {
                create: [
                  {
                    languageId: fa.id,
                    title: media.faTitle,
                    altText: media.faAlt,
                    caption: 'تصویر آزمایشی گالری محصول آریا',
                  },
                  {
                    languageId: en.id,
                    title: media.enTitle,
                    altText: media.enAlt,
                    caption: 'Sample image for the Aria product gallery',
                  },
                ],
              },
            },
          });
        }

        const categories = [
          {
            id: sampleIds.categories[0],
            order: 1,
            fa: [
              'حوله خشک کن آزمایشی',
              'حوله خشک کن های استیل برای نمایش آزمایشی پنل',
              'حوله-خشک-کن-استیل-آزمایشی',
            ],
            en: [
              'Sample towel warmers',
              'Stainless steel towel warmers for admin panel testing',
              'sample-towel-warmers',
            ],
          },
          {
            id: sampleIds.categories[1],
            order: 2,
            fa: [
              'رادیاتور استیل آزمایشی',
              'رادیاتورهای استیل برای نمایش آزمایشی پنل',
              'رادیاتور-استیل-آزمایشی',
            ],
            en: [
              'Sample steel radiators',
              'Steel radiators for admin panel testing',
              'sample-steel-radiators',
            ],
          },
          {
            id: sampleIds.categories[2],
            order: 3,
            fa: [
              'لوازم جانبی آزمایشی',
              'لوازم جانبی برای نمایش آزمایشی پنل',
              'لوازم-جانبی-آزمایشی',
            ],
            en: [
              'Sample accessories',
              'Accessories for admin panel testing',
              'sample-accessories',
            ],
          },
        ] as const;
        for (const category of categories) {
          await tx.productCategory.create({
            data: {
              id: category.id,
              imageId: sampleIds.media,
              displayOrder: category.order,
              translations: {
                create: [
                  {
                    languageId: fa.id,
                    title: category.fa[0],
                    description: category.fa[1],
                    slug: category.fa[2],
                    seoTitle: category.fa[0],
                    seoDescription: category.fa[1],
                  },
                  {
                    languageId: en.id,
                    title: category.en[0],
                    description: category.en[1],
                    slug: category.en[2],
                    seoTitle: category.en[0],
                    seoDescription: category.en[1],
                  },
                ],
              },
            },
          });
        }

        const attributes = [
          {
            id: sampleIds.attributes[0],
            type: AttributeType.SHORT_TEXT,
            order: 1,
            filter: false,
            custom: true,
            fa: ['مدل آزمایشی', 'نام مدل محصول', null],
            en: ['Sample model', 'Product model name', null],
            options: [],
          },
          {
            id: sampleIds.attributes[1],
            type: AttributeType.LONG_TEXT,
            order: 2,
            filter: false,
            custom: true,
            fa: ['توضیح فنی آزمایشی', 'توضیحات تکمیلی محصول', null],
            en: [
              'Sample technical description',
              'Additional product details',
              null,
            ],
            options: [],
          },
          {
            id: sampleIds.attributes[2],
            type: AttributeType.NUMBER,
            order: 3,
            filter: true,
            custom: false,
            fa: ['عرض آزمایشی', 'عرض محصول', 'سانتی متر'],
            en: ['Sample width', 'Product width', 'cm'],
            options: [],
          },
          {
            id: sampleIds.attributes[3],
            type: AttributeType.BOOLEAN,
            order: 4,
            filter: true,
            custom: false,
            fa: ['نصب دیواری آزمایشی', 'امکان نصب روی دیوار', null],
            en: ['Sample wall mounted', 'Wall mounting availability', null],
            options: [],
          },
          {
            id: sampleIds.attributes[4],
            type: AttributeType.SINGLE_SELECT,
            order: 5,
            filter: true,
            custom: true,
            fa: ['جنس آزمایشی', 'گرید استیل محصول', null],
            en: ['Sample material', 'Product steel grade', null],
            options: [
              {
                id: optionIds.steel304,
                fa: 'استیل 304 آزمایشی',
                en: 'Sample 304 steel',
                color: null,
              },
              {
                id: optionIds.steel316,
                fa: 'استیل 316 آزمایشی',
                en: 'Sample 316 steel',
                color: null,
              },
            ],
          },
          {
            id: sampleIds.attributes[5],
            type: AttributeType.MULTI_SELECT,
            order: 6,
            filter: true,
            custom: true,
            fa: ['پرداخت سطح آزمایشی', 'نوع پرداخت سطح محصول', null],
            en: ['Sample surface finish', 'Product surface finish', null],
            options: [
              {
                id: optionIds.chrome,
                fa: 'براق آزمایشی',
                en: 'Sample polished',
                color: null,
              },
              {
                id: optionIds.brushed,
                fa: 'خش دار آزمایشی',
                en: 'Sample brushed',
                color: null,
              },
            ],
          },
          {
            id: sampleIds.attributes[6],
            type: AttributeType.COLOR,
            order: 7,
            filter: true,
            custom: true,
            fa: ['رنگ آزمایشی', 'رنگ قابل انتخاب محصول', null],
            en: ['Sample color', 'Selectable product color', null],
            options: [
              {
                id: optionIds.black,
                fa: 'مشکی آزمایشی',
                en: 'Sample black',
                color: '#171717',
              },
              {
                id: optionIds.gold,
                fa: 'طلایی آزمایشی',
                en: 'Sample gold',
                color: '#C7A04A',
              },
              {
                id: optionIds.silver,
                fa: 'نقره ای آزمایشی',
                en: 'Sample silver',
                color: '#B9BEC5',
              },
            ],
          },
        ] as const;
        for (const attribute of attributes) {
          await tx.attributeDefinition.create({
            data: {
              id: attribute.id,
              type: attribute.type,
              isFilterable: attribute.filter,
              allowCustomValue: attribute.custom,
              displayOrder: attribute.order,
              translations: {
                create: [
                  {
                    languageId: fa.id,
                    name: attribute.fa[0],
                    description: attribute.fa[1],
                    unitLabel: attribute.fa[2],
                  },
                  {
                    languageId: en.id,
                    name: attribute.en[0],
                    description: attribute.en[1],
                    unitLabel: attribute.en[2],
                  },
                ],
              },
              options: {
                create: attribute.options.map((option, index) => ({
                  id: option.id,
                  colorHex: option.color,
                  displayOrder: index + 1,
                  translations: {
                    create: [
                      { languageId: fa.id, label: option.fa },
                      { languageId: en.id, label: option.en },
                    ],
                  },
                })),
              },
            },
          });
        }

        await tx.categoryAttribute.createMany({
          data: [
            ...sampleIds.attributes.map((attributeId, index) => ({
              categoryId: sampleIds.categories[0],
              attributeId,
              displayOrder: index + 1,
              isRequired: index === 0 || index === 2 || index === 4,
            })),
            ...sampleIds.attributes.slice(0, 5).map((attributeId, index) => ({
              categoryId: sampleIds.categories[1],
              attributeId,
              displayOrder: index + 1,
              isRequired: index === 0 || index === 2,
            })),
            {
              categoryId: sampleIds.categories[2],
              attributeId: sampleIds.attributes[0],
              displayOrder: 1,
              isRequired: true,
            },
            {
              categoryId: sampleIds.categories[2],
              attributeId: sampleIds.attributes[6],
              displayOrder: 2,
              isRequired: false,
            },
          ],
        });

        const products = [
          {
            id: sampleIds.products[0],
            sku: 'TEST-LS-TW-001',
            status: ContentStatus.PUBLISHED,
            featured: true,
            showPrice: true,
            basePrice: 12800000,
            order: 1,
            categoryId: sampleIds.categories[0],
            fa: [
              'حوله خشک کن استیل آزمایشی مدل آریا',
              'حوله خشک کن آزمایشی برای بررسی نمایش محصول',
              '<p>این توضیحات صرفا داده آزمایشی پنل لایف استیل است.</p>',
              'حوله-خشک-کن-استیل-آزمایشی-مدل-آریا',
            ],
            en: [
              'Sample Aria steel towel warmer',
              'A sample towel warmer for product display testing',
              '<p>This content is sample data for the Life Steel admin panel.</p>',
              'sample-aria-steel-towel-warmer',
            ],
          },
          {
            id: sampleIds.products[1],
            sku: 'TEST-LS-RD-001',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: true,
            basePrice: 17400000,
            order: 2,
            categoryId: sampleIds.categories[1],
            fa: [
              'رادیاتور استیل آزمایشی مدل نوین',
              'رادیاتور آزمایشی برای بررسی فهرست محصولات',
              '<p>این محصول واقعی نیست و فقط برای تست جدول ها ثبت شده است.</p>',
              'رادیاتور-استیل-آزمایشی-مدل-نوین',
            ],
            en: [
              'Sample Novin steel radiator',
              'A sample radiator for product list testing',
              '<p>This is not a real product and is stored only for table testing.</p>',
              'sample-novin-steel-radiator',
            ],
          },
          {
            id: sampleIds.products[2],
            sku: 'TEST-LS-AC-001',
            status: ContentStatus.DRAFT,
            featured: false,
            showPrice: false,
            basePrice: null,
            order: 3,
            categoryId: sampleIds.categories[2],
            fa: [
              'شیر رادیاتور آزمایشی',
              'لوازم جانبی آزمایشی در وضعیت پیش نویس',
              '<p>داده آزمایشی برای کنترل وضعیت پیش نویس.</p>',
              'شیر-رادیاتور-آزمایشی',
            ],
            en: [
              'Sample radiator valve',
              'Sample accessory in draft status',
              '<p>Sample data for checking the draft state.</p>',
              'sample-radiator-valve',
            ],
          },
          {
            id: sampleIds.products[3],
            sku: 'TEST-LS-TW-002',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: true,
            basePrice: 13900000,
            order: 4,
            categoryId: sampleIds.categories[0],
            fa: [
              'حوله خشک کن استیل مدل سورن',
              'مدل مینیمال سورن برای تست نمایش چند محصول',
              '<p>محصول آزمایشی مدل سورن برای بررسی کارت و اسکرول صفحه اصلی است.</p>',
              'حوله-خشک-کن-استیل-مدل-سورن',
            ],
            en: [
              'Soren stainless steel towel warmer',
              'Minimal Soren model for multi-product display testing',
              '<p>A sample Soren model for testing homepage cards and scrolling.</p>',
              'soren-stainless-steel-towel-warmer',
            ],
          },
          {
            id: sampleIds.products[4],
            sku: 'TEST-LS-TW-003',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: false,
            basePrice: 15100000,
            order: 5,
            categoryId: sampleIds.categories[0],
            fa: [
              'حوله خشک کن استیل مدل آوا',
              'مدل آوا با قیمت ثبت شده و نمایش تماس بگیرید',
              '<p>این داده آزمایشی حالت مخفی بودن قیمت ثبت شده را بررسی میکند.</p>',
              'حوله-خشک-کن-استیل-مدل-آوا',
            ],
            en: [
              'Ava stainless steel towel warmer',
              'Ava model with a stored but hidden price',
              '<p>This sample checks the hidden stored price state.</p>',
              'ava-stainless-steel-towel-warmer',
            ],
          },
          {
            id: sampleIds.products[5],
            sku: 'TEST-LS-RD-002',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: true,
            basePrice: 18900000,
            order: 6,
            categoryId: sampleIds.categories[1],
            fa: [
              'رادیاتور استیل مدل رویا',
              'رادیاتور دکوراتیو رویا برای فضاهای مدرن',
              '<p>محصول آزمایشی برای بررسی نمایش قیمت و کارت رادیاتور.</p>',
              'رادیاتور-استیل-مدل-رویا',
            ],
            en: [
              'Roya stainless steel radiator',
              'Decorative Roya radiator for modern spaces',
              '<p>A sample product for testing radiator cards and prices.</p>',
              'roya-stainless-steel-radiator',
            ],
          },
          {
            id: sampleIds.products[6],
            sku: 'TEST-LS-RD-003',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: true,
            basePrice: 21300000,
            order: 7,
            categoryId: sampleIds.categories[1],
            fa: [
              'رادیاتور استیل مدل صبا',
              'مدل عمودی صبا برای نمایش در فهرست محصولات',
              '<p>داده آزمایشی مدل صبا برای کنترل چیدمان کارت های متعدد.</p>',
              'رادیاتور-استیل-مدل-صبا',
            ],
            en: [
              'Saba stainless steel radiator',
              'Vertical Saba model for the product collection',
              '<p>Sample Saba data for checking a multi-card layout.</p>',
              'saba-stainless-steel-radiator',
            ],
          },
          {
            id: sampleIds.products[7],
            sku: 'TEST-LS-TW-004',
            status: ContentStatus.PUBLISHED,
            featured: false,
            showPrice: true,
            basePrice: 16500000,
            order: 8,
            categoryId: sampleIds.categories[0],
            fa: [
              'حوله خشک کن استیل مدل دنا',
              'مدل دنا برای تکمیل تست اسکرول محصولات منتخب',
              '<p>محصول آزمایشی مدل دنا برای مشاهده آخرین کارت اسکرول.</p>',
              'حوله-خشک-کن-استیل-مدل-دنا',
            ],
            en: [
              'Dena stainless steel towel warmer',
              'Dena model for completing the selected-products scroll test',
              '<p>A sample Dena model for viewing the last scroll card.</p>',
              'dena-stainless-steel-towel-warmer',
            ],
          },
        ] as const;
        for (const product of products) {
          await tx.product.create({
            data: {
              id: product.id,
              sku: product.sku,
              status: product.status,
              coverMediaId:
                product.id === sampleIds.products[0]
                  ? sampleIds.ariaMedia[0]
                  : sampleIds.media,
              isFeatured: product.featured,
              showPrice: product.showPrice,
              basePrice: product.basePrice,
              displayOrder: product.order,
              publishedAt:
                product.status === ContentStatus.PUBLISHED
                  ? new Date('2026-09-01T08:00:00.000Z')
                  : null,
              translations: {
                create: [
                  {
                    languageId: fa.id,
                    title: product.fa[0],
                    summary: product.fa[1],
                    description: product.fa[2],
                    slug: product.fa[3],
                    seoTitle: product.fa[0],
                    seoDescription: product.fa[1],
                    status:
                      product.status === ContentStatus.PUBLISHED
                        ? TranslationStatus.PUBLISHED
                        : TranslationStatus.DRAFT,
                  },
                  {
                    languageId: en.id,
                    title: product.en[0],
                    summary: product.en[1],
                    description: product.en[2],
                    slug: product.en[3],
                    seoTitle: product.en[0],
                    seoDescription: product.en[1],
                    status:
                      product.status === ContentStatus.PUBLISHED
                        ? TranslationStatus.PUBLISHED
                        : TranslationStatus.DRAFT,
                  },
                ],
              },
              categories: {
                create: { categoryId: product.categoryId, isPrimary: true },
              },
              media: {
                create:
                  product.id === sampleIds.products[0]
                    ? sampleIds.ariaMedia.map((mediaId, index) => ({
                        mediaId,
                        displayOrder: index + 1,
                      }))
                    : { mediaId: sampleIds.media, displayOrder: 1 },
              },
            },
          });
        }

        const values = [
          {
            id: 'seed_value_tw_model',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[0],
            order: 1,
            fa: 'آریا تست 100',
            en: 'Aria Test 100',
            number: null,
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_tw_width',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[2],
            order: 2,
            fa: null,
            en: null,
            number: '60',
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_tw_wall',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[3],
            order: 3,
            fa: null,
            en: null,
            number: null,
            boolean: true,
            options: [],
          },
          {
            id: 'seed_value_tw_material',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[4],
            order: 4,
            fa: null,
            en: null,
            number: null,
            boolean: null,
            options: [optionIds.steel304],
          },
          {
            id: 'seed_value_tw_finish',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[5],
            order: 5,
            fa: null,
            en: null,
            number: null,
            boolean: null,
            options: [optionIds.chrome, optionIds.brushed],
          },
          {
            id: 'seed_value_tw_colors',
            product: sampleIds.products[0],
            attribute: sampleIds.attributes[6],
            order: 6,
            fa: null,
            en: null,
            number: null,
            boolean: null,
            options: [optionIds.black, optionIds.gold],
          },
          {
            id: 'seed_value_rd_model',
            product: sampleIds.products[1],
            attribute: sampleIds.attributes[0],
            order: 1,
            fa: 'نوین تست 80',
            en: 'Novin Test 80',
            number: null,
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_rd_description',
            product: sampleIds.products[1],
            attribute: sampleIds.attributes[1],
            order: 2,
            fa: 'توضیح فنی آزمایشی برای کنترل متن بلند',
            en: 'Sample technical description for long text testing',
            number: null,
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_rd_width',
            product: sampleIds.products[1],
            attribute: sampleIds.attributes[2],
            order: 3,
            fa: null,
            en: null,
            number: '80',
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_rd_material',
            product: sampleIds.products[1],
            attribute: sampleIds.attributes[4],
            order: 4,
            fa: null,
            en: null,
            number: null,
            boolean: null,
            options: [optionIds.steel316],
          },
          {
            id: 'seed_value_ac_model',
            product: sampleIds.products[2],
            attribute: sampleIds.attributes[0],
            order: 1,
            fa: 'شیر تست V1',
            en: 'Test Valve V1',
            number: null,
            boolean: null,
            options: [],
          },
          {
            id: 'seed_value_ac_color',
            product: sampleIds.products[2],
            attribute: sampleIds.attributes[6],
            order: 2,
            fa: null,
            en: null,
            number: null,
            boolean: null,
            options: [optionIds.silver],
          },
        ] as const;
        for (const value of values) {
          await tx.productAttributeValue.create({
            data: {
              id: value.id,
              productId: value.product,
              attributeId: value.attribute,
              displayOrder: value.order,
              numberValue: value.number,
              booleanValue: value.boolean,
              rawValue: { seeded: true },
              isCustom: false,
              translations: {
                create: [
                  [fa.id, value.fa],
                  [en.id, value.en],
                ]
                  .filter((item): item is [string, string] => item[1] !== null)
                  .map(([languageId, textValue]) => ({
                    languageId,
                    textValue,
                  })),
              },
              selectedOptions: {
                create: value.options.map((optionId) => ({ optionId })),
              },
            },
          });
        }

        await tx.productColorImage.createMany({
          data: [
            {
              productId: sampleIds.products[0],
              optionId: optionIds.black,
              mediaId: sampleIds.ariaMedia[0],
              isPrimary: false,
            },
            {
              productId: sampleIds.products[0],
              optionId: optionIds.black,
              mediaId: sampleIds.ariaMedia[1],
              isPrimary: true,
            },
            {
              productId: sampleIds.products[0],
              optionId: optionIds.gold,
              mediaId: sampleIds.ariaMedia[2],
              isPrimary: true,
            },
            {
              productId: sampleIds.products[0],
              optionId: optionIds.gold,
              mediaId: sampleIds.ariaMedia[3],
              isPrimary: false,
            },
          ],
        });

        await tx.relatedProduct.createMany({
          data: [
            {
              productId: sampleIds.products[0],
              relatedProductId: sampleIds.products[1],
              displayOrder: 1,
            },
            {
              productId: sampleIds.products[0],
              relatedProductId: sampleIds.products[2],
              displayOrder: 2,
            },
            {
              productId: sampleIds.products[1],
              relatedProductId: sampleIds.products[0],
              displayOrder: 1,
            },
          ],
        });

        const phoneNumber = normalizePhoneNumber(ownerPhone);
        if (!(await tx.admin.findUnique({ where: { phoneNumber } }))) {
          const passwordHash = String(await hash(ownerPassword));
          await tx.admin.create({
            data: {
              firstName: ownerFirstName,
              lastName: ownerLastName,
              phoneNumber,
              passwordHash,
              isOwner: true,
              mustChangePassword: true,
            },
          });
        }
      },
      { timeout: 30_000 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Life Steel database seed completed.'))
  .catch((error: unknown) => {
    console.error('Life Steel database seed failed.', error);
    process.exitCode = 1;
  });
