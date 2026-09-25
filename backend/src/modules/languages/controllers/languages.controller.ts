import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { AUTH_BEARER_SECURITY_NAME } from '../../auth/constants/auth-token.constants';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import {
  CreateLanguageDto,
  ReorderLanguagesDto,
  UpdateLanguageDto,
  UpsertPhraseDto,
} from '../dto/language.dto';
import { LanguagesService } from '../services/languages.service';

@ApiTags('Languages and interface phrases')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard)
@Controller({ path: 'languages', version: '1' })
export class LanguagesController {
  constructor(private readonly languages: LanguagesService) {}

  @Get()
  async list() {
    return createSuccessResponse(
      'فهرست زبان ها دریافت شد.',
      await this.languages.list(),
    );
  }

  @Post()
  async create(@Body() input: CreateLanguageDto) {
    return createSuccessResponse(
      'زبان ایجاد شد.',
      await this.languages.create(input),
    );
  }

  @Put('order')
  async reorder(@Body() input: ReorderLanguagesDto) {
    await this.languages.reorder(input.ids);
    return createSuccessResponse('ترتیب زبان ها ذخیره شد.', null);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateLanguageDto) {
    return createSuccessResponse(
      'زبان ویرایش شد.',
      await this.languages.update(id, input),
    );
  }

  @Post(':id/default')
  async setDefault(@Param('id') id: string) {
    await this.languages.setDefault(id);
    return createSuccessResponse('زبان پیش فرض تغییر کرد.', null);
  }

  @Get('interface-phrases')
  async listPhrases() {
    return createSuccessResponse(
      'عبارت های رابط دریافت شدند.',
      await this.languages.listPhrases(),
    );
  }

  @Put('interface-phrases')
  async upsertPhrase(@Body() input: UpsertPhraseDto) {
    return createSuccessResponse(
      'عبارت رابط ذخیره شد.',
      await this.languages.upsertPhrase(input),
    );
  }
}
