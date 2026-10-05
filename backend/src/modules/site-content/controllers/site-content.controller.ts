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
  HomeSectionStatusDto,
  SaveContactInformationDto,
  SaveHomeSectionDto,
  SaveLocationDto,
  SaveHomePageSettingsDto,
  SaveSitePageDto,
  SaveSiteBannerDto,
  SiteBannerImageDto,
  SiteBannerImageTargetDto,
  SiteGalleryDto,
  SiteOrderDto,
} from '../dto/site-content.dto';
@UseGuards(AccessTokenGuard)
@Controller({ path: 'site-content', version: '1' })
export class SiteContentController {
  constructor(private readonly service: SiteContentService) {}
  @Get('settings') async settings() {
    return createSuccessResponse(
      'تنظیمات صفحه اصلی دریافت شد.',
      await this.service.settings(),
    );
  }
  @Put('settings') async saveSettings(@Body() input: SaveHomePageSettingsDto) {
    return createSuccessResponse(
      'تنظیمات صفحه اصلی ذخیره شد.',
      await this.service.saveSettings(input),
    );
  }
  @Get('banners') async banners() {
    return createSuccessResponse(
      'بنرها دریافت شدند.',
      await this.service.banners(),
    );
  }
  @Get('home-sections') async sections() {
    return createSuccessResponse(
      'بخش های صفحه اصلی دریافت شدند.',
      await this.service.sections(),
    );
  }
  @Post('home-sections') async createSection(
    @Body() input: SaveHomeSectionDto,
  ) {
    return createSuccessResponse(
      'بخش بنر اضافه شد.',
      await this.service.saveSection(null, input),
    );
  }
  @Put('home-sections/order') async orderSections(@Body() input: SiteOrderDto) {
    await this.service.orderSections(input.ids);
    return createSuccessResponse('ترتیب بخش های صفحه اصلی ذخیره شد.', null);
  }
  @Put('home-sections/:id') async saveSection(
    @Param('id') id: string,
    @Body() input: SaveHomeSectionDto,
  ) {
    return createSuccessResponse(
      'بخش بنر ذخیره شد.',
      await this.service.saveSection(id, input),
    );
  }
  @Patch('home-sections/:id/status') async sectionStatus(
    @Param('id') id: string,
    @Body() input: HomeSectionStatusDto,
  ) {
    return createSuccessResponse(
      'وضعیت بخش ذخیره شد.',
      await this.service.sectionStatus(id, input.isActive),
    );
  }
  @Delete('home-sections/:id') async removeSection(@Param('id') id: string) {
    return createSuccessResponse(
      'بخش بنر برای همیشه حذف شد.',
      await this.service.removeSection(id),
    );
  }
  @Post('banners') async createBanner(@Body() input: SaveSiteBannerDto) {
    return createSuccessResponse(
      'بنر اضافه شد.',
      await this.service.saveBanner(null, input),
    );
  }
  @Put('banners/order') async orderBanners(@Body() input: SiteOrderDto) {
    await this.service.orderBanners(input.ids);
    return createSuccessResponse('ترتیب بنرها ذخیره شد.', null);
  }
  @Put('banners/:id') async saveBanner(
    @Param('id') id: string,
    @Body() input: SaveSiteBannerDto,
  ) {
    return createSuccessResponse(
      'بنر ذخیره شد.',
      await this.service.saveBanner(id, input),
    );
  }
  @Put('banners/:id/image') async bannerImage(
    @Param('id') id: string,
    @Body() input: SiteBannerImageDto,
  ) {
    return createSuccessResponse(
      'تصویر بنر ذخیره شد.',
      await this.service.bannerImage(
        id,
        input.languageId,
        input.viewport,
        input.mediaId,
      ),
    );
  }
  @Delete('banners/:id/image') async removeBannerImage(
    @Param('id') id: string,
    @Query() input: SiteBannerImageTargetDto,
  ) {
    return createSuccessResponse(
      'تصویر بنر حذف شد.',
      await this.service.removeBannerImage(
        id,
        input.languageId,
        input.viewport,
      ),
    );
  }
  @Delete('banners/:id') async removeBanner(@Param('id') id: string) {
    return createSuccessResponse(
      'بنر حذف شد.',
      await this.service.removeBanner(id),
    );
  }
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
