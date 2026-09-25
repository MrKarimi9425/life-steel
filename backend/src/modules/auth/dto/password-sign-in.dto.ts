import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class PasswordSignInDto {
  @ApiProperty({ example: '09120000000' })
  @IsString()
  @Matches(/^(?:\+?98|0)?9\d{9}$/)
  phoneNumber!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
