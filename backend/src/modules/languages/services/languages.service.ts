import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import type {
  CreateLanguageDto,
  UpdateLanguageDto,
  UpsertPhraseDto,
} from '../dto/language.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.language.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(input: CreateLanguageDto) {
    const existing = await this.prisma.language.findUnique({
      where: { code: input.code },
    });
    if (existing) throw new ConflictException('کد زبان قبلا ثبت شده است.');
    const latest = await this.prisma.language.aggregate({
      _max: { displayOrder: true },
    });
    return this.prisma.language.create({
      data: {
        ...input,
        displayOrder: (latest._max.displayOrder ?? -1) + 1,
      },
    });
  }

  async reorder(ids: string[]) {
    const languages = await this.prisma.language.findMany({
      select: { id: true },
    });
    const expectedIds = new Set(languages.map((language) => language.id));
    if (
      ids.length !== expectedIds.size ||
      ids.some((id) => !expectedIds.has(id))
    ) {
      throw new BadRequestException('فهرست ترتیب زبان ها کامل یا معتبر نیست.');
    }
    await this.prisma.$transaction(
      ids.map((id, displayOrder) =>
        this.prisma.language.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );
  }

  async update(id: string, input: UpdateLanguageDto) {
    const language = await this.requireLanguage(id);
    if (language.isDefault && input.isActive === false) {
      throw new BadRequestException('زبان پیش فرض را نمیتوان غیر فعال کرد.');
    }
    try {
      return await this.prisma.language.update({ where: { id }, data: input });
    } catch (error) {
      if (this.isUniqueError(error)) {
        throw new ConflictException('کد زبان قبلا ثبت شده است.');
      }
      throw error;
    }
  }

  async setDefault(id: string) {
    await this.requireLanguage(id);
    await this.prisma.$transaction([
      this.prisma.language.updateMany({ data: { isDefault: false } }),
      this.prisma.language.update({
        where: { id },
        data: { isDefault: true, isActive: true },
      }),
    ]);
  }

  listPhrases() {
    return this.prisma.interfacePhrase.findMany({
      include: { translations: true },
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    });
  }

  async upsertPhrase(input: UpsertPhraseDto) {
    const languageIds = [
      ...new Set(input.translations.map((item) => item.languageId)),
    ];
    const languageCount = await this.prisma.language.count({
      where: { id: { in: languageIds } },
    });
    if (languageCount !== languageIds.length) {
      throw new BadRequestException('حداقل یکی از زبان ها معتبر نیست.');
    }

    return this.prisma.interfacePhrase.upsert({
      where: { namespace_key: { namespace: input.namespace, key: input.key } },
      create: {
        key: input.key,
        namespace: input.namespace,
        description: input.description || null,
        translations: {
          create: input.translations.map((item) => ({
            languageId: item.languageId,
            value: item.value,
          })),
        },
      },
      update: {
        description: input.description || null,
        translations: {
          deleteMany: {},
          create: input.translations.map((item) => ({
            languageId: item.languageId,
            value: item.value,
          })),
        },
      },
      include: { translations: true },
    });
  }

  private async requireLanguage(id: string) {
    const language = await this.prisma.language.findUnique({ where: { id } });
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    return language;
  }

  private isUniqueError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
