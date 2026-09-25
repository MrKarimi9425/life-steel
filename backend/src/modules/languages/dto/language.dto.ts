import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TextDirection } from '../../../generated/prisma/client';

export class CreateLanguageDto {
  @IsString()
  @Matches(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nativeName!: string;

  @IsEnum(TextDirection)
  direction!: TextDirection;

  @IsBoolean()
  isActive!: boolean;

  @IsBoolean()
  isRequiredForPublish!: boolean;
}

export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {}

export class ReorderLanguagesDto {
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  ids!: string[];
}

export class PhraseTranslationDto {
  @IsString()
  languageId!: string;

  @IsString()
  value!: string;
}

export class UpsertPhraseDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_.-]+$/)
  key!: string;

  @IsString()
  @Matches(/^[a-z][a-z0-9_.-]+$/)
  namespace!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @ValidateNested({ each: true })
  @Type(() => PhraseTranslationDto)
  translations!: PhraseTranslationDto[];
}
