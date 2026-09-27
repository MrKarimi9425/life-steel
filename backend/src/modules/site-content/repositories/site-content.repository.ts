import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import type { Prisma } from '../../../generated/prisma/client';
import type {
  ContactMessageQueryDto,
  CreateContactMessageDto,
  SaveContactInformationDto,
  SaveLocationDto,
} from '../dto/site-content.dto';

const pageInclude = {
  translations: true,
  media: {
    include: { media: { include: { variants: true, translations: true } } },
    orderBy: { displayOrder: 'asc' as const },
  },
};
@Injectable()
export class SiteContentRepository {
  constructor(private readonly db: PrismaService) {}
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
        _count: {
          select: {
            productMedia: true,
            productCovers: true,
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
