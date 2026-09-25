import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { AUTH_BEARER_SECURITY_NAME } from '../../auth/constants/auth-token.constants';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { ExternalVideoDto } from '../dto/external-video.dto';
import { UpdateMediaTranslationsDto } from '../dto/update-media-translations.dto';
import { MediaService } from '../services/media.service';

@ApiTags('Media library')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard)
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  async list() {
    return createSuccessResponse(
      'رسانه ها دریافت شدند.',
      await this.media.list(),
    );
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 250 * 1024 * 1024 } }),
  )
  async upload(
    @UploadedFile() file?: Express.Multer.File,
    @Query('imageProfile') imageProfile?: string,
  ) {
    if (!file) throw new BadRequestException('فایل ارسال نشده است.');
    if (imageProfile && imageProfile !== 'square-max-1200') {
      throw new BadRequestException('نوع تصویر معتبر نیست.');
    }
    return createSuccessResponse(
      'رسانه بارگذاری شد.',
      await this.media.upload(file, imageProfile === 'square-max-1200'),
    );
  }

  @Post('external-video')
  async externalVideo(@Body() input: ExternalVideoDto) {
    return createSuccessResponse(
      'ویدیوی خارجی ثبت شد.',
      await this.media.createExternalVideo(input.url, input.title),
    );
  }

  @Patch(':id/translations')
  async updateTranslations(
    @Param('id') id: string,
    @Body() input: UpdateMediaTranslationsDto,
  ) {
    return createSuccessResponse(
      'اطلاعات رسانه ذخیره شد.',
      await this.media.updateTranslations(id, input.translations),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.media.remove(id);
    return createSuccessResponse('رسانه حذف شد.', null);
  }
}
