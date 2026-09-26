import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { PublicBlogListQueryDto } from '../dto/blog.dto';
import { BlogService } from '../services/blog.service';

@ApiTags('Public API')
@Controller({ path: 'public/blog', version: '1' })
export class PublicBlogController {
  constructor(private readonly blog: BlogService) {}
  @Get() async list(@Query() query: PublicBlogListQueryDto) {
    return createSuccessResponse(
      'مقاله ها دریافت شدند.',
      await this.blog.publicList(query),
    );
  }
  @Get('categories/:language') async categories(
    @Param('language') language: string,
  ) {
    return createSuccessResponse(
      'دسته بندی های وبلاگ دریافت شدند.',
      await this.blog.publicTaxonomy('categories', language),
    );
  }
  @Get('tags/:language') async tags(@Param('language') language: string) {
    return createSuccessResponse(
      'برچسب های وبلاگ دریافت شدند.',
      await this.blog.publicTaxonomy('tags', language),
    );
  }
  @Get(':language/:slug') async detail(
    @Param('language') language: string,
    @Param('slug') slug: string,
  ) {
    return createSuccessResponse(
      'مقاله دریافت شد.',
      await this.blog.publicDetail(language, slug),
    );
  }
}
