import { PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ContentStatus,
  TranslationStatus,
} from '../../../generated/prisma/client';

export class BlogTaxonomyTranslationDto {
  @IsString() @IsNotEmpty() languageId!: string;
  @IsString() @IsNotEmpty() @MaxLength(180) title!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsString() @MaxLength(255) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) seoDescription?: string;
}
export class CreateBlogTaxonomyDto {
  @IsBoolean() isActive!: boolean;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => BlogTaxonomyTranslationDto)
  translations!: BlogTaxonomyTranslationDto[];
}
export class UpdateBlogTaxonomyDto extends PartialType(CreateBlogTaxonomyDto) {}
export class BlogArticleTranslationDto {
  @IsString() @IsNotEmpty() languageId!: string;
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(10000) summary?: string;
  @IsObject() content!: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(255) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) seoDescription?: string;
  @IsEnum(TranslationStatus) status!: TranslationStatus;
}
export class CreateBlogArticleDto {
  @IsEnum(ContentStatus) status!: ContentStatus;
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  categoryIds!: string[];
  @IsOptional() @IsString() primaryCategoryId?: string | null;
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  tagIds!: string[];
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => BlogArticleTranslationDto)
  translations!: BlogArticleTranslationDto[];
}
export class UpdateBlogArticleDto extends PartialType(CreateBlogArticleDto) {}
export class UpdateBlogGalleryDto {
  @IsArray() @ArrayUnique() @IsString({ each: true }) mediaIds!: string[];
  @IsOptional() @IsString() coverMediaId?: string | null;
}
export class BlogOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}
export class BlogListQueryDto {
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() tagId?: string;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(1000) pageSize = 20;
}

export class PublicBlogListQueryDto extends PickType(BlogListQueryDto, [
  'search',
  'categoryId',
  'tagId',
  'page',
  'pageSize',
] as const) {
  @IsString() @IsNotEmpty() @MaxLength(12) language!: string;
}
