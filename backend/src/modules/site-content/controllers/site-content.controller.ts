import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { createSuccessResponse } from '../../../common/http/success-response';
import { SiteContentService } from '../services/site-content.service';
import {
  ContactMessageQueryDto,
  ContactMessageStatusDto,
  SaveContactInformationDto,
  SaveLocationDto,
  SaveSitePageDto,
  SiteGalleryDto,
  SiteOrderDto,
} from '../dto/site-content.dto';
@UseGuards(AccessTokenGuard)
@Controller({ path: 'site-content', version: '1' })
export class SiteContentController {
  constructor(private readonly service: SiteContentService) {}
  @Get('about') async page() {
    return createSuccessResponse('صفحه دریافت شد.', await this.service.page());
  }
  @Put('about') async savePage(@Body() input: SaveSitePageDto) {
    return createSuccessResponse(
      'صفحه ذخیره شد.',
      await this.service.savePage(input),
    );
  }
  @Put('about/gallery') async gallery(@Body() input: SiteGalleryDto) {
    return createSuccessResponse(
      'گالری ذخیره شد.',
      await this.service.gallery(input.mediaIds),
    );
  }
  @Delete('about/gallery/:id') async removeImage(@Param('id') id: string) {
    return createSuccessResponse(
      'تصویر حذف شد.',
      await this.service.removeImage(id),
    );
  }
  @Get('contacts') async contacts() {
    return createSuccessResponse(
      'اطلاعات تماس دریافت شد.',
      await this.service.contacts(),
    );
  }
  @Post('contacts') async createContact(
    @Body() input: SaveContactInformationDto,
  ) {
    return createSuccessResponse(
      'اطلاعات تماس اضافه شد.',
      await this.service.saveContact(null, input),
    );
  }
  @Put('contacts/order') async order(@Body() input: SiteOrderDto) {
    await this.service.orderContacts(input.ids);
    return createSuccessResponse('ترتیب ذخیره شد.', null);
  }
  @Put('contacts/:id') async saveContact(
    @Param('id') id: string,
    @Body() input: SaveContactInformationDto,
  ) {
    return createSuccessResponse(
      'اطلاعات تماس ذخیره شد.',
      await this.service.saveContact(id, input),
    );
  }
  @Delete('contacts/:id') async removeContact(@Param('id') id: string) {
    await this.service.removeContact(id);
    return createSuccessResponse('اطلاعات تماس حذف شد.', null);
  }
  @Get('location') async location() {
    return createSuccessResponse(
      'موقعیت دریافت شد.',
      await this.service.location(),
    );
  }
  @Put('location') async saveLocation(@Body() input: SaveLocationDto) {
    return createSuccessResponse(
      'موقعیت ذخیره شد.',
      await this.service.saveLocation(input),
    );
  }
  @Get('messages') async messages(@Query() query: ContactMessageQueryDto) {
    return createSuccessResponse(
      'پیام ها دریافت شدند.',
      await this.service.messages(query),
    );
  }
  @Get('messages/:id') async message(@Param('id') id: string) {
    return createSuccessResponse(
      'پیام دریافت شد.',
      await this.service.message(id),
    );
  }
  @Patch('messages/:id') async status(
    @Param('id') id: string,
    @Body() input: ContactMessageStatusDto,
  ) {
    return createSuccessResponse(
      'وضعیت پیام ذخیره شد.',
      await this.service.status(id, input.status),
    );
  }
  @Delete('messages/:id') async removeMessage(@Param('id') id: string) {
    await this.service.removeMessage(id);
    return createSuccessResponse('پیام برای همیشه حذف شد.', null);
  }
}
