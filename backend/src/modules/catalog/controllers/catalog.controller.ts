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
  CreateAttributeDto,
  CreateCategoryDto,
  CreateProductDto,
  ReorderItemsDto,
  UpdateAttributeDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from '../dto/catalog.dto';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('Product catalog')
@ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
@UseGuards(AccessTokenGuard)
@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  async categories() {
    return createSuccessResponse(
      'دسته بندی ها دریافت شدند.',
      await this.catalog.listCategories(),
    );
  }

  @Post('categories')
  async createCategory(@Body() input: CreateCategoryDto) {
    return createSuccessResponse(
      'دسته بندی ایجاد شد.',
      await this.catalog.createCategory(input),
    );
  }

  @Put('categories/order')
  async reorderCategories(@Body() input: ReorderItemsDto) {
    await this.catalog.reorderCategories(input.ids);
    return createSuccessResponse('ترتیب دسته بندی ها ذخیره شد.', null);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() input: UpdateCategoryDto,
  ) {
    return createSuccessResponse(
      'دسته بندی ویرایش شد.',
      await this.catalog.updateCategory(id, input),
    );
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.catalog.deleteCategory(id);
    return createSuccessResponse('دسته بندی حذف شد.', null);
  }

  @Get('attributes')
  async attributes() {
    return createSuccessResponse(
      'ویژگی ها دریافت شدند.',
      await this.catalog.listAttributes(),
    );
  }

  @Post('attributes')
  async createAttribute(@Body() input: CreateAttributeDto) {
    return createSuccessResponse(
      'ویژگی ایجاد شد.',
      await this.catalog.createAttribute(input),
    );
  }

  @Put('attributes/order')
  async reorderAttributes(@Body() input: ReorderItemsDto) {
    await this.catalog.reorderAttributes(input.ids);
    return createSuccessResponse('ترتیب ویژگی ها ذخیره شد.', null);
  }

  @Patch('attributes/:id')
  async updateAttribute(
    @Param('id') id: string,
    @Body() input: UpdateAttributeDto,
  ) {
    return createSuccessResponse(
      'ویژگی ویرایش شد.',
      await this.catalog.updateAttribute(id, input),
    );
  }

  @Get('products')
  async products(@Query() query: ListProductsQueryDto) {
    return createSuccessResponse(
      'محصولات دریافت شدند.',
      await this.catalog.listProducts(query),
    );
  }

  @Get('product-options')
  async productOptions() {
    return createSuccessResponse(
      'فهرست انتخاب محصولات دریافت شد.',
      await this.catalog.listProductOptions(),
    );
  }

  @Put('products/order')
  async reorderProducts(@Body() input: ReorderItemsDto) {
    await this.catalog.reorderProducts(input.ids);
    return createSuccessResponse('ترتیب محصولات ذخیره شد.', null);
  }

  @Get('products/:id')
  async product(@Param('id') id: string) {
    return createSuccessResponse(
      'محصول دریافت شد.',
      await this.catalog.getProduct(id),
    );
  }

  @Post('products')
  async createProduct(@Body() input: CreateProductDto) {
    return createSuccessResponse(
      'محصول ایجاد شد.',
      await this.catalog.createProduct(input),
    );
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() input: UpdateProductDto,
  ) {
    return createSuccessResponse(
      'محصول ویرایش شد.',
      await this.catalog.updateProduct(id, input),
    );
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.catalog.deleteProduct(id);
    return createSuccessResponse('محصول برای همیشه حذف شد.', null);
  }

  @Delete('products/:id/media/:mediaId')
  async deleteProductMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ) {
    const result = await this.catalog.deleteProductMedia(id, mediaId);
    return createSuccessResponse(
      result.removedFromStorage
        ? 'فایل برای همیشه حذف شد.'
        : 'فایل از محصول برداشته شد، اما در جای دیگری استفاده می شود یا پاکسازی فایل کامل نشد.',
      result,
    );
  }

  @Post('products/:id/archive')
  async archiveProduct(@Param('id') id: string) {
    await this.catalog.archiveProduct(id);
    return createSuccessResponse('محصول بایگانی شد.', null);
  }
}
