import { BadRequestException } from '@nestjs/common';
import { SiteContentService } from './site-content.service';
import { SiteContentRepository } from '../repositories/site-content.repository';
import { MediaService } from '../../media/services/media.service';
import {
  HomeSectionType,
  SiteSectionPage,
} from '../../../generated/prisma/client';

describe('SiteContentService banners', () => {
  const repository = {
    languages: jest.fn(),
    banner: jest.fn(),
    saveBanner: jest.fn(),
    images: jest.fn(),
    bannerImage: jest.fn(),
    banners: jest.fn(),
    section: jest.fn(),
    sections: jest.fn(),
    sectionStatus: jest.fn(),
    orderSections: jest.fn(),
    language: jest.fn(),
    findPage: jest.fn(),
    contacts: jest.fn(),
    location: jest.fn(),
    settings: jest.fn(),
    saveSettings: jest.fn(),
  };
  const media = { remove: jest.fn() };
  const service = new SiteContentService(
    repository as unknown as SiteContentRepository,
    media as unknown as MediaService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    repository.languages.mockResolvedValue([{ id: 'fa', code: 'fa' }]);
    repository.settings.mockResolvedValue({
      id: 'main',
      selectedProductsLimit: 6,
    });
    repository.section.mockResolvedValue({
      id: 'home_hero',
      page: SiteSectionPage.HOME,
      type: HomeSectionType.HERO,
      banners: [],
    });
  });

  it('requires an image before publishing', async () => {
    repository.banner.mockResolvedValue({
      id: 'banner',
      translations: [
        {
          languageId: 'fa',
          desktopImageId: 'desktop',
          tabletImageId: null,
          mobileImageId: 'mobile',
        },
      ],
    });
    await expect(
      service.saveBanner('banner', {
        sectionId: 'home_hero',
        isPublished: true,
        translations: [
          {
            languageId: 'fa',
            altText: 'عنوان بنر',
            targetUrl: '/products',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.saveBanner).not.toHaveBeenCalled();
  });

  it('accepts internal and external targets but rejects unsafe protocols', async () => {
    repository.saveBanner.mockResolvedValue({ id: 'banner', translations: [] });
    repository.languages.mockResolvedValue([
      { id: 'fa', code: 'fa' },
      { id: 'en', code: 'en' },
    ]);
    await service.saveBanner(null, {
      sectionId: 'home_hero',
      isPublished: false,
      translations: [
        { languageId: 'fa', altText: 'داخلی', targetUrl: '/products' },
        {
          languageId: 'en',
          altText: 'External',
          targetUrl: 'https://example.com/products',
        },
      ],
    });
    expect(repository.saveBanner).toHaveBeenCalled();
    repository.languages.mockResolvedValue([{ id: 'fa', code: 'fa' }]);
    await expect(
      service.saveBanner(null, {
        sectionId: 'home_hero',
        isPublished: false,
        translations: [
          {
            languageId: 'fa',
            altText: 'نامعتبر',
            targetUrl: 'javascript:alert(1)',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an image already attached to another feature', async () => {
    repository.banner.mockResolvedValue({
      id: 'banner',
      translations: [
        {
          languageId: 'fa',
          desktopImageId: null,
          tabletImageId: null,
          mobileImageId: null,
        },
      ],
    });
    repository.images.mockResolvedValue([
      {
        id: 'image',
        path: 'image.webp',
        bannerDesktop: null,
        bannerTablet: null,
        bannerMobile: null,
        _count: { productColorImages: 1 },
      },
    ]);
    await expect(
      service.bannerImage('banner', 'fa', 'desktop', 'image'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.bannerImage).not.toHaveBeenCalled();
  });

  it('returns only published banners with an image and locale translation', async () => {
    repository.language.mockResolvedValue({ id: 'fa' });
    repository.findPage.mockResolvedValue(null);
    repository.contacts.mockResolvedValue([]);
    repository.location.mockResolvedValue(null);
    repository.sections.mockResolvedValue([
      {
        id: 'home_hero',
        page: SiteSectionPage.HOME,
        type: HomeSectionType.HERO,
        isActive: true,
        displayOrder: 0,
        banners: [
          {
            id: 'published',
            isPublished: true,
            translations: [
              {
                languageId: 'fa',
                altText: 'عنوان بنر',
                targetUrl: '/products',
                desktopImage: {
                  path: 'desktop.webp',
                  width: 1920,
                  height: 560,
                },
                tabletImage: {
                  path: 'tablet.webp',
                  width: 1024,
                  height: 500,
                },
                mobileImage: {
                  path: 'mobile.webp',
                  width: 680,
                  height: 720,
                },
              },
            ],
          },
          {
            id: 'draft',
            isPublished: false,
            translations: [{ languageId: 'fa', altText: 'پیش نویس' }],
          },
        ],
      },
    ]);
    const result = await service.publicContent('fa');
    expect(result.homePage).toEqual({
      selectedProductsLimit: 6,
      sections: [
        {
          id: 'home_hero',
          type: HomeSectionType.HERO,
          displayOrder: 0,
          banners: [
            {
              id: 'published',
              altText: 'عنوان بنر',
              targetUrl: '/products',
              desktopImage: {
                path: 'desktop.webp',
                width: 1920,
                height: 560,
              },
              tabletImage: {
                path: 'tablet.webp',
                width: 1024,
                height: 500,
              },
              mobileImage: {
                path: 'mobile.webp',
                width: 680,
                height: 720,
              },
            },
          ],
        },
      ],
    });
    expect(result.products).toEqual({ banner: null });
    expect(result.blog).toEqual({ banner: null });
  });

  it('returns the published product catalog banner separately from home sections', async () => {
    repository.language.mockResolvedValue({ id: 'fa' });
    repository.findPage.mockResolvedValue(null);
    repository.contacts.mockResolvedValue([]);
    repository.location.mockResolvedValue(null);
    repository.sections.mockResolvedValue([
      {
        id: 'products_banner',
        page: SiteSectionPage.PRODUCTS,
        type: HomeSectionType.BANNER_FULL,
        isActive: true,
        displayOrder: 0,
        banners: [
          {
            id: 'catalog-banner',
            isPublished: true,
            translations: [
              {
                languageId: 'fa',
                altText: 'بنر محصولات',
                targetUrl: '/products',
                desktopImage: {
                  path: 'products-desktop.webp',
                  width: 1440,
                  height: 300,
                },
                tabletImage: {
                  path: 'products-tablet.webp',
                  width: 1024,
                  height: 320,
                },
                mobileImage: {
                  path: 'products-mobile.webp',
                  width: 750,
                  height: 420,
                },
              },
            ],
          },
        ],
      },
    ]);

    const result = await service.publicContent('fa');

    expect(result.homePage.sections).toEqual([]);
    expect(result.products.banner).toMatchObject({
      id: 'catalog-banner',
      altText: 'بنر محصولات',
      targetUrl: '/products',
      desktopImage: { path: 'products-desktop.webp' },
      tabletImage: { path: 'products-tablet.webp' },
      mobileImage: { path: 'products-mobile.webp' },
    });
    expect(result.blog).toEqual({ banner: null });
  });

  it('returns the published blog banner separately from home sections', async () => {
    repository.language.mockResolvedValue({ id: 'fa' });
    repository.findPage.mockResolvedValue(null);
    repository.contacts.mockResolvedValue([]);
    repository.location.mockResolvedValue(null);
    repository.sections.mockResolvedValue([
      {
        id: 'blog_banner',
        page: SiteSectionPage.BLOG,
        type: HomeSectionType.BANNER_FULL,
        isActive: true,
        displayOrder: 0,
        banners: [
          {
            id: 'blog-page-banner',
            isPublished: true,
            translations: [
              {
                languageId: 'fa',
                altText: 'بنر وبلاگ',
                targetUrl: '/blog',
                desktopImage: {
                  path: 'blog-desktop.webp',
                  width: 1440,
                  height: 300,
                },
                tabletImage: {
                  path: 'blog-tablet.webp',
                  width: 1024,
                  height: 320,
                },
                mobileImage: {
                  path: 'blog-mobile.webp',
                  width: 750,
                  height: 420,
                },
              },
            ],
          },
        ],
      },
    ]);

    const result = await service.publicContent('fa');

    expect(result.homePage.sections).toEqual([]);
    expect(result.products).toEqual({ banner: null });
    expect(result.blog.banner).toMatchObject({
      id: 'blog-page-banner',
      altText: 'بنر وبلاگ',
      targetUrl: '/blog',
      desktopImage: { path: 'blog-desktop.webp' },
      tabletImage: { path: 'blog-tablet.webp' },
      mobileImage: { path: 'blog-mobile.webp' },
    });
  });

  it('saves the selected products limit', async () => {
    repository.saveSettings.mockResolvedValue({
      id: 'main',
      selectedProductsLimit: 8,
    });
    await expect(
      service.saveSettings({ selectedProductsLimit: 8 }),
    ).resolves.toMatchObject({ selectedProductsLimit: 8 });
    expect(repository.saveSettings).toHaveBeenCalledWith({
      selectedProductsLimit: 8,
    });
  });

  it('keeps Hero active and fixed at the first position', async () => {
    await expect(
      service.sectionStatus('home_hero', false),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.sectionStatus).not.toHaveBeenCalled();

    repository.sections.mockResolvedValue([
      {
        id: 'home_hero',
        page: SiteSectionPage.HOME,
        type: HomeSectionType.HERO,
      },
      {
        id: 'home_categories',
        page: SiteSectionPage.HOME,
        type: HomeSectionType.CATEGORIES,
      },
      {
        id: 'custom_banner',
        page: SiteSectionPage.HOME,
        type: HomeSectionType.BANNER_FULL,
      },
      {
        id: 'products_banner',
        page: SiteSectionPage.PRODUCTS,
        type: HomeSectionType.BANNER_FULL,
      },
    ]);
    await service.orderSections(['custom_banner', 'home_categories']);
    expect(repository.orderSections).toHaveBeenCalledWith([
      { id: 'home_hero', order: 0 },
      { id: 'custom_banner', order: 1 },
      { id: 'home_categories', order: 2 },
    ]);
  });

  it('enforces the configured banner capacity of a custom section', async () => {
    repository.section.mockResolvedValue({
      id: 'full_banner',
      page: SiteSectionPage.HOME,
      type: HomeSectionType.BANNER_FULL,
      banners: [{ id: 'existing' }],
    });
    await expect(
      service.saveBanner(null, {
        sectionId: 'full_banner',
        isPublished: false,
        translations: [{ languageId: 'fa', altText: 'بنر دوم', targetUrl: '' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.saveBanner).not.toHaveBeenCalled();
  });
});
