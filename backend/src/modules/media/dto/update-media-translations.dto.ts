import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MediaTranslationDto {
  @IsString()
  languageId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

export class UpdateMediaTranslationsDto {
  @IsArray()
  @ArrayUnique((translation: MediaTranslationDto) => translation.languageId)
  @ValidateNested({ each: true })
  @Type(() => MediaTranslationDto)
  translations!: MediaTranslationDto[];
}
