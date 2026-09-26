import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class ColorPriceDto {
  @IsString() optionId!: string;
  @IsOptional() @IsString() @Matches(/^[1-9][0-9]{0,14}$/) amount?:
    string | null;
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  mediaIds?: string[];
  @IsOptional() @IsString() primaryMediaId?: string | null;
}
export class UpdateProductPricingDto {
  @IsBoolean() showPrice!: boolean;
  @IsOptional() @IsString() @Matches(/^[1-9][0-9]{0,14}$/) basePrice?:
    string | null;
  @IsArray()
  @ArrayMaxSize(1000)
  @ArrayUnique((entry: ColorPriceDto) => entry.optionId)
  @ValidateNested({ each: true })
  @Type(() => ColorPriceDto)
  colors!: ColorPriceDto[];
}
