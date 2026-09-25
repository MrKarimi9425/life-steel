import { IsString, IsUrl, MaxLength } from 'class-validator';

export class ExternalVideoDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  url!: string;

  @IsString()
  @MaxLength(255)
  title!: string;
}
