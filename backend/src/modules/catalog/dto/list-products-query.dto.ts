import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
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
