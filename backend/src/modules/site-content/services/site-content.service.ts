import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteContentRepository } from '../repositories/site-content.repository';
import { MediaService } from '../../media/services/media.service';
import { validateBlogDocument } from '../../blog/utils/blog-document';
import type {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  SaveContactInformationDto,
  SaveLocationDto,
  SaveSitePageDto,
} from '../dto/site-content.dto';

@Injectable()
export class SiteContentService {
  constructor(
    private readonly repository: SiteContentRepository,
    private readonly media: MediaService,
  ) {}
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
          Object.values(image._count).some((count) => count > 0),
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
  async publicContent(code: string) {
    const language = await this.repository.language(code);
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    const [page, contacts, location] = await Promise.all([
      this.repository.findPage('about'),
      this.contacts(),
      this.location(),
    ]);
    const translation = page?.translations.find(
      (item) => item.languageId === language.id,
    );
    return {
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
