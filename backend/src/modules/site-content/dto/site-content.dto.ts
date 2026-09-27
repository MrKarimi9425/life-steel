import { Type, Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import {
  ContactInformationType,
  ContactMessageStatus,
} from '../../../generated/prisma/client';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
export class SiteTranslationDto {
  @IsString() languageId!: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsObject() content!: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(255) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) seoDescription?: string;
}
export class SaveSitePageDto {
  @IsBoolean() isPublished!: boolean;
  @IsArray()
  @ArrayUnique((item: SiteTranslationDto) => item?.languageId)
  @ValidateNested({ each: true })
  @Type(() => SiteTranslationDto)
  translations!: SiteTranslationDto[];
}
export class SiteGalleryDto {
  @IsArray() @ArrayUnique() @IsString({ each: true }) mediaIds!: string[];
}
export class ContactTranslationDto {
  @IsString() languageId!: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(150) title!: string;
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(2000) value!: string;
}
export class SaveContactInformationDto {
  @IsEnum(ContactInformationType) type!: ContactInformationType;
  @IsBoolean() isActive!: boolean;
  @IsArray()
  @ArrayUnique((item: ContactTranslationDto) => item?.languageId)
  @ValidateNested({ each: true })
  @Type(() => ContactTranslationDto)
  translations!: ContactTranslationDto[];
}
export class SiteOrderDto {
  @IsArray() @ArrayUnique() @IsString({ each: true }) ids!: string[];
}
export class SaveLocationDto {
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number | null;
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number | null;
}
export class CreateContactMessageDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @Transform(trim) @IsString() @Matches(/^\+?[0-9]{7,15}$/) phone!: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string;
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(200) subject!: string;
  @Transform(trim) @IsString() @MinLength(5) @MaxLength(10000) message!: string;
}
export class ContactMessageStatusDto {
  @IsEnum(ContactMessageStatus) status!: ContactMessageStatus;
}
export class ContactMessageQueryDto {
  @IsOptional() @IsString() @MaxLength(150) search?: string;
  @IsOptional() @IsEnum(ContactMessageStatus) status?: ContactMessageStatus;
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @IsIn([10, 20, 25, 50, 100, 1000]) pageSize = 20;
}
