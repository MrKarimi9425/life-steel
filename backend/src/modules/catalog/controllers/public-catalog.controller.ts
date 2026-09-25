import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createSuccessResponse } from '../../../common/http/success-response';
import { PublicProductsQueryDto } from '../dto/list-products-query.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('Public API')
@Controller({ path: 'public/products', version: '1' })
export class PublicCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories/:language')
  async categories(@Param('language') language: string) {
    return createSuccessResponse(
      'دسته بندی ها دریافت شدند.',
      await this.catalog.listPublicCategories(language),
    );
  }

  @Get('filters/:language')
  async filters(@Param('language') language: string) {
    return createSuccessResponse(
      'فیلترها دریافت شدند.',
      await this.catalog.listPublicFilters(language),
    );
  }

  @Get()
  async list(@Query() query: PublicProductsQueryDto) {
    return createSuccessResponse(
      'محصولات دریافت شدند.',
      await this.catalog.listPublicProducts(query),
    );
  }

  @Get(':language/:slug')
  async detail(
    @Param('language') language: string,
    @Param('slug') slug: string,
  ) {
    return createSuccessResponse(
      'محصول دریافت شد.',
      await this.catalog.getPublicProduct(language, slug),
    );
  }
}
