import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ description: 'Localized success message' })
  message!: string;

  @ApiProperty({ description: 'Operation result payload', nullable: true })
  data!: unknown;
}
