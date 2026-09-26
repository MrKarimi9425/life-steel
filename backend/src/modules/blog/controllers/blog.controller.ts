import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { AUTH_BEARER_SECURITY_NAME } from '../../auth/constants/auth-token.constants';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import {
  BlogListQueryDto,
  BlogOrderDto,
  CreateBlogArticleDto,
  CreateBlogTaxonomyDto,
  UpdateBlogArticleDto,
  UpdateBlogGalleryDto,
  UpdateBlogTaxonomyDto,
} from '../dto/blog.dto';
import { BlogService } from '../services/blog.service';

@ApiTags('Blog')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard)
@Controller({ path: 'blog', version: '1' })
export class BlogController {
  constructor(private readonly blog: BlogService) {}
  @Get('articles') async list(@Query() query: BlogListQueryDto) {
    return createSuccessResponse(
      'مقاله ها دریافت شدند.',
      await this.blog.list(query),
    );
  }
  @Post('articles') async create(@Body() input: CreateBlogArticleDto) {
    return createSuccessResponse(
      'مقاله ایجاد شد.',
      await this.blog.create(input),
    );
  }
  @Put('articles/order') async order(@Body() input: BlogOrderDto) {
    await this.blog.reorder('articles', input.ids);
    return createSuccessResponse('ترتیب مقاله ها ذخیره شد.', null);
  }
  @Get('articles/:id') async detail(@Param('id') id: string) {
    return createSuccessResponse(
      'مقاله دریافت شد.',
      await this.blog.article(id),
    );
  }
  @Patch('articles/:id') async update(
    @Param('id') id: string,
    @Body() input: UpdateBlogArticleDto,
  ) {
    return createSuccessResponse(
      'مقاله ویرایش شد.',
      await this.blog.update(id, input),
    );
  }
  @Post('articles/:id/archive') async archive(@Param('id') id: string) {
    await this.blog.archive(id);
    return createSuccessResponse('مقاله بایگانی شد.', null);
  }
  @Delete('articles/:id') async remove(@Param('id') id: string) {
    const result = await this.blog.remove(id);
    return createSuccessResponse(
      result.cleanupComplete
        ? 'مقاله و تصاویر آن برای همیشه حذف شدند.'
        : 'مقاله حذف شد، اما پاکسازی برخی فایل ها کامل نشد.',
      result,
    );
  }
  @Put('articles/:id/gallery') async gallery(
    @Param('id') id: string,
    @Body() input: UpdateBlogGalleryDto,
  ) {
    return createSuccessResponse(
      'گالری مقاله ذخیره شد.',
      await this.blog.gallery(id, input),
    );
  }
  @Delete('articles/:id/gallery/:mediaId') async removeImage(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    const result = await this.blog.removeImage(id, mediaId);
    return createSuccessResponse(
      result.removedFromStorage
        ? 'تصویر برای همیشه حذف شد.'
        : 'تصویر از گالری برداشته شد، اما پاکسازی فایل کامل نشد.',
      result,
    );
  }
  @Get('categories') async categories() {
    return createSuccessResponse(
      'دسته بندی های وبلاگ دریافت شدند.',
      await this.blog.categories(),
    );
  }
  @Post('categories') async createCategory(
    @Body() input: CreateBlogTaxonomyDto,
  ) {
    return createSuccessResponse(
      'دسته بندی ایجاد شد.',
      await this.blog.createTaxonomy('categories', input),
    );
  }
  @Put('categories/order') async categoryOrder(@Body() input: BlogOrderDto) {
    await this.blog.reorder('categories', input.ids);
    return createSuccessResponse('ترتیب دسته بندی ها ذخیره شد.', null);
  }
  @Patch('categories/:id') async updateCategory(
    @Param('id') id: string,
    @Body() input: UpdateBlogTaxonomyDto,
  ) {
    return createSuccessResponse(
      'دسته بندی ویرایش شد.',
      await this.blog.updateTaxonomy('categories', id, input),
    );
  }
  @Delete('categories/:id') async removeCategory(@Param('id') id: string) {
    await this.blog.removeTaxonomy('categories', id);
    return createSuccessResponse('دسته بندی حذف شد.', null);
  }
  @Get('tags') async tags() {
    return createSuccessResponse(
      'برچسب های وبلاگ دریافت شدند.',
      await this.blog.tags(),
    );
  }
  @Post('tags') async createTag(@Body() input: CreateBlogTaxonomyDto) {
    return createSuccessResponse(
      'برچسب ایجاد شد.',
      await this.blog.createTaxonomy('tags', input),
    );
  }
  @Put('tags/order') async tagOrder(@Body() input: BlogOrderDto) {
    await this.blog.reorder('tags', input.ids);
    return createSuccessResponse('ترتیب برچسب ها ذخیره شد.', null);
  }
  @Patch('tags/:id') async updateTag(
    @Param('id') id: string,
    @Body() input: UpdateBlogTaxonomyDto,
  ) {
    return createSuccessResponse(
      'برچسب ویرایش شد.',
      await this.blog.updateTaxonomy('tags', id, input),
    );
  }
  @Delete('tags/:id') async removeTag(@Param('id') id: string) {
    await this.blog.removeTaxonomy('tags', id);
    return createSuccessResponse('برچسب حذف شد.', null);
  }
}
