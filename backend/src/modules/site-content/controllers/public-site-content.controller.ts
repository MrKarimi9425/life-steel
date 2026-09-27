import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { createSuccessResponse } from '../../../common/http/success-response';
import { CreateContactMessageDto } from '../dto/site-content.dto';
import { SiteContentService } from '../services/site-content.service';
@Controller({ path: 'public/site-content', version: '1' })
export class PublicSiteContentController {
  constructor(private readonly service: SiteContentService) {}
  @Get(':language') async content(@Param('language') code: string) {
    return createSuccessResponse(
      'اطلاعات سایت دریافت شد.',
      await this.service.publicContent(code),
    );
  }
  @Post('messages') async message(@Body() input: CreateContactMessageDto) {
    await this.service.createMessage(input);
    return createSuccessResponse('پیام شما ثبت شد.', null);
  }
}
