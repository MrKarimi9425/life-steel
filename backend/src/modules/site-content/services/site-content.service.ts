import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteContentRepository } from '../repositories/site-content.repository';
import { MediaService } from '../../media/services/media.service';
import { validateBlogDocument } from '../../blog/utils/blog-document';
import {
  HomeSectionType,
  SiteSectionPage,
} from '../../../generated/prisma/client';
import type {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  SaveContactInformationDto,
  SaveLocationDto,
  SaveHomePageSettingsDto,
  SaveHomeSectionDto,
  SaveSitePageDto,
  SaveSiteBannerDto,
} from '../dto/site-content.dto';

type BannerViewport = 'desktop' | 'tablet' | 'mobile';
type SectionRow = Awaited<
  ReturnType<SiteContentRepository['sections']>
>[number];
const bannerViewports: BannerViewport[] = ['desktop', 'tablet', 'mobile'];
const customSectionTypes: HomeSectionType[] = [
  HomeSectionType.BANNER_FULL,
  HomeSectionType.BANNER_SPLIT,
];
const bannerHostingSectionTypes: HomeSectionType[] = [
  HomeSectionType.HERO,
  ...customSectionTypes,
];
const bannerImageIds = (
  translations: Array<{
    desktopImageId: string | null;
    tabletImageId: string | null;
    mobileImageId: string | null;
  }>,
) =>
  translations
    .flatMap((item) => [
      item.desktopImageId,
      item.tabletImageId,
      item.mobileImageId,
    ])
    .filter((id): id is string => Boolean(id));

function validateBannerTarget(value: string) {
  if (!value) return;
  if (value.startsWith('/') && !value.startsWith('//') && !/\s/.test(value))
    return;
  try {
    const url = new URL(value);
    if ((url.protocol === 'https:' || url.protocol === 'http:') && url.hostname)
      return;
  } catch {
    // Invalid URLs are reported with the same field message below.
  }
  throw new BadRequestException(
    'لینک بنر باید مسیر داخلی یا نشانی کامل سایت باشد.',
  );
}

@Injectable()
export class SiteContentService {
  constructor(
    private readonly repository: SiteContentRepository,
    private readonly media: MediaService,
  ) {}
  sections() {
    return this.repository.sections();
  }
  banners(sectionId?: string) {
    return this.repository.banners(sectionId);
  }
  settings() {
    return this.repository.settings();
  }
  saveSettings(input: SaveHomePageSettingsDto) {
    return this.repository.saveSettings(input);
  }
  private async section(id: string) {
    const section = await this.repository.section(id);
    if (!section) throw new NotFoundException('بخش بنر پیدا نشد.');
    return section;
  }
  async saveSection(id: string | null, input: SaveHomeSectionDto) {
    const existing = id ? await this.section(id) : null;
    if (
      existing &&
      (existing.page !== SiteSectionPage.HOME ||
        !customSectionTypes.includes(existing.type))
    )
      throw new BadRequestException('بخش های اصلی قابل ویرایش نیستند.');
    if (
      input.type === HomeSectionType.BANNER_FULL &&
      (existing?.banners.length ?? 0) > 1
    )
      throw new BadRequestException(
        'برای تبدیل به بنر تمام عرض، ابتدا بنر اضافی را حذف کنید.',
      );
    return this.repository.saveSection(id, input);
  }
  async sectionStatus(id: string, isActive: boolean) {
    const section = await this.section(id);
    if (section.page !== SiteSectionPage.HOME)
      throw new BadRequestException('وضعیت این بخش ثابت است.');
    if (section.type === HomeSectionType.HERO && !isActive)
      throw new BadRequestException('بخش Hero همیشه باید فعال باشد.');
    return this.repository.sectionStatus(id, isActive);
  }
  async removeSection(id: string) {
    const section = await this.section(id);
    if (
      section.page !== SiteSectionPage.HOME ||
      !customSectionTypes.includes(section.type)
    )
      throw new BadRequestException('بخش های اصلی قابل حذف نیستند.');
    await this.repository.removeSection(id);
    const cleanup = await Promise.all(
      section.banners
        .flatMap((banner) => bannerImageIds(banner.translations))
        .map((mediaId) => this.cleanupBannerImage(mediaId)),
    );
    return { removedFromStorage: cleanup.every(Boolean) };
  }
  async orderSections(ids: string[]) {
    const sections = (await this.sections()).filter(
      (section) => section.page === SiteSectionPage.HOME,
    );
    const movable = sections.filter(
      (section) => section.type !== HomeSectionType.HERO,
    );
    if (
      ids.length !== movable.length ||
      ids.some((id) => !movable.some((section) => section.id === id))
    )
      throw new BadRequestException('ترتیب بخش های صفحه اصلی کامل نیست.');
    await this.repository.orderSections([
      {
        id: sections.find((section) => section.type === HomeSectionType.HERO)!
          .id,
        order: 0,
      },
      ...ids.map((id, index) => ({ id, order: index + 1 })),
    ]);
  }
  private async banner(id: string) {
    const banner = await this.repository.banner(id);
    if (!banner) throw new NotFoundException('بنر پیدا نشد.');
    return banner;
  }
  private async cleanupBannerImage(mediaId: string): Promise<boolean> {
    try {
      return await this.media.remove(mediaId, { skipIfReferenced: true });
    } catch {
      return false;
    }
  }
  async saveBanner(id: string | null, input: SaveSiteBannerDto) {
    await this.translations(input.translations);
    input.translations.forEach((item) => validateBannerTarget(item.targetUrl));
    const existing = id ? await this.banner(id) : null;
    const section = await this.section(input.sectionId);
    if (!bannerHostingSectionTypes.includes(section.type))
      throw new BadRequestException('این بخش امکان ثبت بنر ندارد.');
    const otherBannerCount = section.banners.filter(
      (banner) => banner.id !== existing?.id,
    ).length;
    const limit =
      section.type === HomeSectionType.BANNER_FULL
        ? 1
        : section.type === HomeSectionType.BANNER_SPLIT
          ? 2
          : Number.POSITIVE_INFINITY;
    if (otherBannerCount >= limit)
      throw new BadRequestException('ظرفیت بنرهای این بخش کامل است.');
    if (
      input.isPublished &&
      input.translations.some((item) => {
        const translation = existing?.translations.find(
          (row) => row.languageId === item.languageId,
        );
        return (
          !translation?.desktopImageId ||
          !translation.tabletImageId ||
          !translation.mobileImageId
        );
      })
    )
      throw new BadRequestException(
        'برای انتشار، سه تصویر هر زبان ثبت شده الزامی است.',
      );
    const removedIds = existing
      ? bannerImageIds(
          existing.translations.filter(
            (row) =>
              !input.translations.some(
                (item) => item.languageId === row.languageId,
              ),
          ),
        )
      : [];
    const saved = await this.repository.saveBanner(id, input);
    const cleanup = await Promise.all(
      removedIds.map((mediaId) => this.cleanupBannerImage(mediaId)),
    );
    return { ...saved, removedUnusedImagesFromStorage: cleanup.every(Boolean) };
  }
  async bannerImage(
    id: string,
    languageId: string,
    viewport: BannerViewport,
    mediaId: string,
  ) {
    if (!bannerViewports.includes(viewport))
      throw new BadRequestException('اندازه تصویر بنر نامعتبر است.');
    const banner = await this.banner(id);
    const translation = banner.translations.find(
      (row) => row.languageId === languageId,
    );
    if (!translation) throw new NotFoundException('زبان بنر پیدا نشد.');
    const oldId = translation[`${viewport}ImageId`];
    if (oldId === mediaId)
      return { ...banner, removedPreviousImageFromStorage: true };
    const images = await this.repository.images([mediaId]);
    const image = images[0];
    if (
      !image?.path ||
      image.bannerDesktop ||
      image.bannerTablet ||
      image.bannerMobile ||
      Object.values(image._count).some((count) => count > 0)
    )
      throw new BadRequestException(
        'تصویر آماده نیست یا به بخش دیگری تعلق دارد.',
      );
    const updated = await this.repository.bannerImage(
      id,
      languageId,
      viewport,
      mediaId,
    );
    return {
      ...updated,
      removedPreviousImageFromStorage: oldId
        ? await this.cleanupBannerImage(oldId)
        : true,
    };
  }
  async removeBannerImage(
    id: string,
    languageId: string,
    viewport: BannerViewport,
  ) {
    if (!bannerViewports.includes(viewport))
      throw new BadRequestException('اندازه تصویر بنر نامعتبر است.');
    const banner = await this.banner(id);
    const translation = banner.translations.find(
      (row) => row.languageId === languageId,
    );
    const imageId = translation?.[`${viewport}ImageId`];
    if (!imageId) throw new NotFoundException('تصویر بنر پیدا نشد.');
    await this.repository.bannerImage(id, languageId, viewport, null);
    return {
      removedFromStorage: await this.cleanupBannerImage(imageId),
    };
  }
  async removeBanner(id: string) {
    const banner = await this.banner(id);
    await this.repository.removeBanner(id);
    const cleanup = await Promise.all(
      bannerImageIds(banner.translations).map((mediaId) =>
        this.cleanupBannerImage(mediaId),
      ),
    );
    return { removedFromStorage: cleanup.every(Boolean) };
  }
  async orderBanners(ids: string[]) {
    const all = await this.banners();
    const selected = all.filter((row) => ids.includes(row.id));
    if (
      selected.length !== ids.length ||
      new Set(selected.map((row) => row.sectionId)).size !== 1 ||
      all.filter((row) => row.sectionId === selected[0]?.sectionId).length !==
        ids.length
    )
      throw new BadRequestException('شناسه بنر نامعتبر است.');
    const slots = all
      .filter((row) => ids.includes(row.id))
      .map((row) => row.displayOrder);
    await this.repository.orderBanners(
      ids.map((id, index) => ({ id, order: slots[index]! })),
    );
  }
  page() {
    return this.repository.page('about');
  }
  private async translations(items: Array<{ languageId: string }>) {
    const languages = await this.repository.languages(
      items.map((item) => item.languageId),
    );
    if (
      languages.length !== items.length ||
      !languages.some((language) => language.code === 'fa')
    )
      throw new BadRequestException(
        'ترجمه فارسی الزامی است و زبان ها باید فعال باشند.',
      );
  }
  async savePage(input: SaveSitePageDto) {
    await this.translations(input.translations);
    const page = await this.page();
    const gallery = new Map(
      page.media
        .filter((item) => item.media.path)
        .map((item) => [item.mediaId, `/api/public/media/${item.media.path}`]),
    );
    return this.repository.savePage(
      page.id,
      input.isPublished,
      input.translations.map((item) => ({
        title: item.title,
        seoTitle: item.seoTitle || null,
        seoDescription: item.seoDescription || null,
        content: validateBlogDocument(item.content, gallery).document,
        language: { connect: { id: item.languageId } },
      })),
    );
  }
  async gallery(ids: string[]) {
    const page = await this.page();
    const images = await this.repository.images(ids);
    if (images.length !== ids.length)
      throw new BadRequestException('فقط تصاویر آماده مجاز هستند.');
    if (
      images.some(
        (image) =>
          !page.media.some((item) => item.mediaId === image.id) &&
          (image.bannerDesktop !== null ||
            image.bannerTablet !== null ||
            image.bannerMobile !== null ||
            Object.values(image._count).some((count) => count > 0)),
      )
    )
      throw new BadRequestException(
        'تصویر متعلق به گالری دیگری است. تصویر جدید بارگذاری کنید.',
      );
    const gallery = new Map(
      page.media
        .filter((item) => item.media.path)
        .map((item) => [item.mediaId, `/api/public/media/${item.media.path}`]),
    );
    for (const translation of page.translations)
      if (
        validateBlogDocument(translation.content, gallery).imageIds.some(
          (id) => !ids.includes(id),
        )
      )
        throw new BadRequestException(
          'ابتدا تصویر را از متن صفحه حذف و ذخیره کنید.',
        );
    return this.repository.gallery(page.id, ids);
  }
  async removeImage(id: string) {
    const page = await this.page();
    if (!page.media.some((item) => item.mediaId === id))
      throw new NotFoundException('تصویر پیدا نشد.');
    await this.gallery(
      page.media.map((item) => item.mediaId).filter((item) => item !== id),
    );
    return {
      removedFromStorage: await this.media.remove(id, {
        skipIfReferenced: true,
      }),
    };
  }
  contacts() {
    return this.repository.contacts();
  }
  async saveContact(id: string | null, input: SaveContactInformationDto) {
    await this.translations(input.translations);
    if (id && !(await this.repository.contact(id)))
      throw new NotFoundException('اطلاعات تماس پیدا نشد.');
    for (const item of input.translations) {
      if (input.type === 'LINK') {
        let valid = false;
        try {
          const url = new URL(item.value);
          valid =
            ['http:', 'https:'].includes(url.protocol) &&
            !url.username &&
            !url.password;
        } catch {
          /* Invalid URL. */
        }
        if (!valid)
          throw new BadRequestException(
            'لینک معتبر با http یا https وارد کنید.',
          );
      }
      if (
        input.type === 'EMAIL' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)
      )
        throw new BadRequestException('ایمیل معتبر نیست.');
      if (input.type === 'PHONE' && !/^\+?[0-9 ()-]{7,30}$/.test(item.value))
        throw new BadRequestException('شماره تلفن معتبر نیست.');
    }
    return this.repository.saveContact(id, input);
  }
  async removeContact(id: string) {
    if (!(await this.repository.contact(id)))
      throw new NotFoundException('اطلاعات تماس پیدا نشد.');
    await this.repository.removeContact(id);
  }
  async orderContacts(ids: string[]) {
    const all = await this.contacts();
    if (ids.some((id) => !all.some((row) => row.id === id)))
      throw new BadRequestException('شناسه نامعتبر است.');
    const slots = all
      .filter((row) => ids.includes(row.id))
      .map((row) => row.displayOrder);
    await this.repository.orderContacts(
      ids.map((id, index) => ({ id, order: slots[index]! })),
    );
  }
  location() {
    return this.repository.location();
  }
  saveLocation(input: SaveLocationDto) {
    if ((input.latitude == null) !== (input.longitude == null))
      throw new BadRequestException(
        'عرض و طول جغرافیایی باید با هم ثبت یا پاک شوند.',
      );
    return this.repository.saveLocation({
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    });
  }
  messages(query: ContactMessageQueryDto) {
    return this.repository.messages(query);
  }
  async message(id: string) {
    const row = await this.repository.message(id);
    if (!row) throw new NotFoundException('پیام پیدا نشد.');
    return row;
  }
  async status(id: string, status: 'NEW' | 'READ' | 'FOLLOWED_UP') {
    await this.message(id);
    return this.repository.status(id, status);
  }
  async removeMessage(id: string) {
    await this.message(id);
    await this.repository.removeMessage(id);
  }
  createMessage(input: CreateContactMessageDto) {
    return this.repository.createMessage(input);
  }
  private publicBanners(section: SectionRow | undefined, languageId: string) {
    if (!section?.isActive) return [];
    return section.banners.flatMap((banner) => {
      const translation = banner.translations.find(
        (item) => item.languageId === languageId,
      );
      return banner.isPublished &&
        translation?.desktopImage?.path &&
        translation.tabletImage?.path &&
        translation.mobileImage?.path
        ? [
            {
              id: banner.id,
              altText: translation.altText,
              targetUrl: translation.targetUrl,
              desktopImage: {
                path: translation.desktopImage.path,
                width: translation.desktopImage.width,
                height: translation.desktopImage.height,
              },
              tabletImage: {
                path: translation.tabletImage.path,
                width: translation.tabletImage.width,
                height: translation.tabletImage.height,
              },
              mobileImage: {
                path: translation.mobileImage.path,
                width: translation.mobileImage.width,
                height: translation.mobileImage.height,
              },
            },
          ]
        : [];
    });
  }
  async publicContent(code: string) {
    const language = await this.repository.language(code);
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    const [page, contacts, location, sections, settings] = await Promise.all([
      this.repository.findPage('about'),
      this.contacts(),
      this.location(),
      this.sections(),
      this.settings(),
    ]);
    const translation = page?.translations.find(
      (item) => item.languageId === language.id,
    );
    const publicSections = sections
      .filter(
        (section) => section.page === SiteSectionPage.HOME && section.isActive,
      )
      .map((section) => ({
        id: section.id,
        type: section.type,
        displayOrder: section.displayOrder,
        banners: this.publicBanners(section, language.id),
      }));
    const productBannerSection = sections.find(
      (section) => section.page === SiteSectionPage.PRODUCTS,
    );
    const blogBannerSection = sections.find(
      (section) => section.page === SiteSectionPage.BLOG,
    );
    return {
      homePage: {
        selectedProductsLimit: settings.selectedProductsLimit,
        sections: publicSections,
      },
      products: {
        banner:
          this.publicBanners(productBannerSection, language.id)[0] ?? null,
      },
      blog: {
        banner: this.publicBanners(blogBannerSection, language.id)[0] ?? null,
      },
      about:
        page?.isPublished && translation
          ? {
              title: translation.title,
              content: translation.content,
              seoTitle: translation.seoTitle,
              seoDescription: translation.seoDescription,
              media: page.media.map((item) => ({
                id: item.media.id,
                path: item.media.path,
                width: item.media.width,
                height: item.media.height,
                variants: item.media.variants.map((variant) => ({
                  kind: variant.kind,
                  path: variant.path,
                  width: variant.width,
                  height: variant.height,
                })),
                translations: item.media.translations.filter(
                  (t) => t.languageId === language.id,
                ),
              })),
            }
          : null,
      contacts: contacts
        .filter((row) => row.isActive)
        .flatMap((row) => {
          const t = row.translations.find(
            (item) => item.languageId === language.id,
          );
          return t
            ? [{ id: row.id, type: row.type, title: t.title, value: t.value }]
            : [];
        }),
      location: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : null,
    };
  }
}
