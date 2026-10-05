import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ContentStatus } from '../../../generated/prisma/client';

export class ListProductsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  attributeId?: string;

  @IsOptional()
  @IsString()
  optionId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxNumber?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  booleanValue?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? (value as unknown[]) : [value],
  )
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  attributeFilters?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  minPrice?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  maxPrice?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  pageSize = 20;
}

export class PublicProductsQueryDto extends ListProductsQueryDto {
  @IsString()
  language!: string;
}
