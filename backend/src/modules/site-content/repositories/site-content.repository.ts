import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import type { Prisma, SiteSectionPage } from '../../../generated/prisma/client';
import type {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  SaveContactInformationDto,
  SaveLocationDto,
  SaveHomePageSettingsDto,
  SaveHomeSectionDto,
  SaveSiteBannerDto,
} from '../dto/site-content.dto';

const pageInclude = {
  translations: true,
  media: {
    include: { media: { include: { variants: true, translations: true } } },
    orderBy: { displayOrder: 'asc' as const },
  },
};
const bannerInclude = {
  translations: {
    include: {
      desktopImage: { include: { variants: true, translations: true } },
      tabletImage: { include: { variants: true, translations: true } },
      mobileImage: { include: { variants: true, translations: true } },
    },
  },
};
const sectionInclude = {
  banners: {
    include: bannerInclude,
    orderBy: [{ displayOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
};
@Injectable()
export class SiteContentRepository {
  constructor(private readonly db: PrismaService) {}
  sections(page?: SiteSectionPage) {
    return this.db.homeSection.findMany({
      where: page ? { page } : undefined,
      include: sectionInclude,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }
  section(id: string) {
    return this.db.homeSection.findUnique({
      where: { id },
      include: sectionInclude,
    });
  }
  async saveSection(id: string | null, input: SaveHomeSectionDto) {
    if (id)
      return this.db.homeSection.update({
        where: { id },
        data: input,
        include: sectionInclude,
      });
    const latest = await this.db.homeSection.aggregate({
      _max: { displayOrder: true },
    });
    return this.db.homeSection.create({
      data: {
        ...input,
        displayOrder: (latest._max.displayOrder ?? 0) + 1,
      },
      include: sectionInclude,
    });
  }
  sectionStatus(id: string, isActive: boolean) {
    return this.db.homeSection.update({
      where: { id },
      data: { isActive },
      include: sectionInclude,
    });
  }
  removeSection(id: string) {
    return this.db.homeSection.delete({ where: { id } });
  }
  orderSections(rows: Array<{ id: string; order: number }>) {
    return this.db.$transaction(
      rows.map((row) =>
        this.db.homeSection.update({
          where: { id: row.id },
          data: { displayOrder: row.order },
        }),
      ),
    );
  }
  banners(sectionId?: string) {
    return this.db.siteBanner.findMany({
      where: sectionId ? { sectionId } : undefined,
      include: bannerInclude,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }
  banner(id: string) {
    return this.db.siteBanner.findUnique({
      where: { id },
      include: bannerInclude,
    });
  }
  async saveBanner(id: string | null, input: SaveSiteBannerDto) {
    if (id)
      return this.db.siteBanner.update({
        where: { id },
        data: {
          sectionId: input.sectionId,
          isPublished: input.isPublished,
          translations: {
            deleteMany: {
              languageId: {
                notIn: input.translations.map((item) => item.languageId),
              },
            },
            upsert: input.translations.map((item) => ({
              where: {
                bannerId_languageId: {
                  bannerId: id,
                  languageId: item.languageId,
                },
              },
              create: item,
              update: { altText: item.altText, targetUrl: item.targetUrl },
            })),
          },
        },
        include: bannerInclude,
      });
    const latest = await this.db.siteBanner.aggregate({
      where: { sectionId: input.sectionId },
      _max: { displayOrder: true },
    });
    return this.db.siteBanner.create({
      data: {
        sectionId: input.sectionId,
        isPublished: input.isPublished,
        displayOrder: (latest._max.displayOrder ?? -1) + 1,
        translations: { create: input.translations },
      },
      include: bannerInclude,
    });
  }
  async bannerImage(
    id: string,
    languageId: string,
    viewport: 'desktop' | 'tablet' | 'mobile',
    imageId: string | null,
  ) {
    await this.db.$transaction([
      this.db.siteBannerTranslation.update({
        where: { bannerId_languageId: { bannerId: id, languageId } },
        data: { [`${viewport}ImageId`]: imageId },
      }),
      ...(imageId === null
        ? [
            this.db.siteBanner.update({
              where: { id },
              data: { isPublished: false },
            }),
          ]
        : []),
    ]);
    return this.banner(id);
  }
  removeBanner(id: string) {
    return this.db.siteBanner.delete({ where: { id } });
  }
  orderBanners(rows: Array<{ id: string; order: number }>) {
    return this.db.$transaction(
      rows.map((row) =>
        this.db.siteBanner.update({
          where: { id: row.id },
          data: { displayOrder: row.order },
        }),
      ),
    );
  }
  page(key: string) {
    return this.db.sitePage.upsert({
      where: { key },
      create: { key },
      update: {},
      include: pageInclude,
    });
  }
  findPage(key: string) {
    return this.db.sitePage.findUnique({
      where: { key },
      include: pageInclude,
    });
  }
  savePage(
    id: string,
    isPublished: boolean,
    translations: Prisma.SitePageTranslationCreateWithoutPageInput[],
  ) {
    return this.db.sitePage.update({
      where: { id },
      data: {
        isPublished,
        translations: { deleteMany: {}, create: translations },
      },
      include: pageInclude,
    });
  }
  language(code: string) {
    return this.db.language.findFirst({ where: { code, isActive: true } });
  }
  languages(ids: string[]) {
    return this.db.language.findMany({
      where: { id: { in: ids }, isActive: true },
    });
  }
  images(ids: string[]) {
    return this.db.mediaAsset.findMany({
      where: { id: { in: ids }, kind: 'IMAGE', processingStatus: 'READY' },
      include: {
        bannerDesktop: { select: { bannerId: true } },
        bannerTablet: { select: { bannerId: true } },
        bannerMobile: { select: { bannerId: true } },
        _count: {
          select: {
            productMedia: true,
            productCovers: true,
            productColorImages: true,
            categoryImages: true,
            articleMedia: true,
            sitePageMedia: true,
          },
        },
      },
    });
  }
  gallery(id: string, mediaIds: string[]) {
    return this.db.sitePage.update({
      where: { id },
      data: {
        media: {
          deleteMany: {},
          create: mediaIds.map((mediaId, displayOrder) => ({
            mediaId,
            displayOrder,
          })),
        },
      },
      include: pageInclude,
    });
  }
  contacts() {
    return this.db.contactInformation.findMany({
      include: { translations: true },
      orderBy: { displayOrder: 'asc' },
    });
  }
  contact(id: string) {
    return this.db.contactInformation.findUnique({ where: { id } });
  }
  async saveContact(id: string | null, input: SaveContactInformationDto) {
    if (id)
      return this.db.contactInformation.update({
        where: { id },
        data: {
          type: input.type,
          isActive: input.isActive,
          translations: { deleteMany: {}, create: input.translations },
        },
        include: { translations: true },
      });
    const latest = await this.db.contactInformation.aggregate({
      _max: { displayOrder: true },
    });
    return this.db.contactInformation.create({
      data: {
        type: input.type,
        isActive: input.isActive,
        displayOrder: (latest._max.displayOrder ?? -1) + 1,
        translations: { create: input.translations },
      },
      include: { translations: true },
    });
  }
  removeContact(id: string) {
    return this.db.contactInformation.delete({ where: { id } });
  }
  orderContacts(rows: Array<{ id: string; order: number }>) {
    return this.db.$transaction(
      rows.map((row) =>
        this.db.contactInformation.update({
          where: { id: row.id },
          data: { displayOrder: row.order },
        }),
      ),
    );
  }
  location() {
    return this.db.siteLocation.findUnique({ where: { id: 'main' } });
  }
  saveLocation(input: SaveLocationDto) {
    return this.db.siteLocation.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...input },
      update: input,
    });
  }
  settings() {
    return this.db.siteSettings.upsert({
      where: { id: 'main' },
      create: { id: 'main' },
      update: {},
    });
  }
  saveSettings(input: SaveHomePageSettingsDto) {
    return this.db.siteSettings.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...input },
      update: input,
    });
  }
  createMessage(input: CreateContactMessageDto) {
    return this.db.contactMessage.create({ data: input, select: { id: true } });
  }
  async messages(query: ContactMessageQueryDto) {
    const where: Prisma.ContactMessageWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: ['name', 'phone', 'subject'].map((key) => ({
              [key]: { contains: query.search },
            })),
          }
        : {}),
    };
    const [items, total] = await this.db.$transaction([
      this.db.contactMessage.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          subject: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.db.contactMessage.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }
  message(id: string) {
    return this.db.contactMessage.findUnique({ where: { id } });
  }
  status(id: string, status: 'NEW' | 'READ' | 'FOLLOWED_UP') {
    return this.db.contactMessage.update({ where: { id }, data: { status } });
  }
  removeMessage(id: string) {
    return this.db.contactMessage.delete({ where: { id } });
  }
}
