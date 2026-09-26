import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  AttributeType,
  ContentStatus,
  TranslationStatus,
} from '../../../generated/prisma/client';

export class CategoryTranslationDto {
  @IsString()
  languageId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @IsString()
  @Matches(/^[a-z0-9\u0600-\u06ff]+(?:-[a-z0-9\u0600-\u06ff]+)*$/i)
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}

export class CreateCategoryDto {
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  translations!: CategoryTranslationDto[];
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class AttributeTranslationDto {
  @IsString()
  languageId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  unitLabel?: string;
}

export class AttributeOptionTranslationDto {
  @IsString()
  languageId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  label!: string;
}

export class AttributeOptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i)
  colorHex?: string;

  @IsBoolean()
  isActive!: boolean;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @ValidateNested({ each: true })
  @Type(() => AttributeOptionTranslationDto)
  translations!: AttributeOptionTranslationDto[];
}

export class CategoryAttributeDto {
  @IsString()
  categoryId!: string;

  @IsBoolean()
  isRequired!: boolean;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class CreateAttributeDto {
  @IsEnum(AttributeType)
  type!: AttributeType;

  @IsBoolean()
  isFilterable!: boolean;

  @IsBoolean()
  isVisible!: boolean;

  @IsBoolean()
  isActive!: boolean;

  @IsBoolean()
  allowCustomValue!: boolean;

  @ValidateNested({ each: true })
  @Type(() => AttributeTranslationDto)
  translations!: AttributeTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  options!: AttributeOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryAttributeDto)
  categories!: CategoryAttributeDto[];
}

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}

export class ProductTranslationDto {
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsString()
  languageId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9\u0600-\u06ff]+(?:-[a-z0-9\u0600-\u06ff]+)*$/i)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsEnum(TranslationStatus)
  status!: TranslationStatus;
}

export class AttributeValueTranslationDto {
  @IsString()
  languageId!: string;

  @IsString()
  textValue!: string;
}

export class CustomAttributeDefinitionDto {
  @IsEnum(AttributeType)
  type!: AttributeType;

  @ValidateNested({ each: true })
  @Type(() => AttributeTranslationDto)
  translations!: AttributeTranslationDto[];
}

export class ProductAttributeValueDto {
  @ValidateIf((value: ProductAttributeValueDto) => !value.customDefinition)
  @IsString()
  attributeId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomAttributeDefinitionDto)
  customDefinition?: CustomAttributeDefinitionDto;

  @IsOptional()
  @IsNumber()
  numberValue?: number;

  @IsOptional()
  @IsBoolean()
  booleanValue?: boolean;

  @IsOptional()
  @IsObject()
  rawValue?: Record<string, unknown>;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  optionIds!: string[];

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueTranslationDto)
  translations!: AttributeValueTranslationDto[];
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsEnum(ContentStatus)
  status!: ContentStatus;

  @IsOptional()
  @IsString()
  coverMediaId?: string;

  @IsBoolean()
  isFeatured!: boolean;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  categoryIds!: string[];

  @IsOptional()
  @IsString()
  primaryCategoryId?: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  mediaIds!: string[];

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  relatedProductIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations!: ProductTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeValueDto)
  attributeValues!: ProductAttributeValueDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ReorderItemsDto {
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  ids!: string[];
}
