import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { PrismaService } from '../../../database/prisma/prisma.service';

@ApiTags('Public API')
@Controller({ path: 'public/languages', version: '1' })
export class PublicLanguagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const languages = await this.prisma.language.findMany({
      where: { isActive: true },
      select: {
        code: true,
        name: true,
        nativeName: true,
        direction: true,
        isDefault: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
    return createSuccessResponse('زبان ها دریافت شدند.', languages);
  }

  @Get(':code/interface-phrases')
  async phrases(@Param('code') code: string) {
    const language = await this.prisma.language.findFirst({
      where: { code, isActive: true },
    });
    if (!language) throw new NotFoundException('زبان پیدا نشد.');
    const translations = await this.prisma.interfacePhraseTranslation.findMany({
      where: { languageId: language.id },
      include: { phrase: true },
    });
    return createSuccessResponse(
      'عبارت ها دریافت شدند.',
      Object.fromEntries(
        translations.map((item) => [
          `${item.phrase.namespace}.${item.phrase.key}`,
          item.value,
        ]),
      ),
    );
  }
}
