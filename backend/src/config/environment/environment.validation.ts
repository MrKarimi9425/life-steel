import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

type JwtDuration = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV!: NodeEnvironment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/[^/?#*]+$/)
  FRONTEND_ORIGIN!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^mysql:\/\/.+$/)
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(ms|s|m|h|d|w|y)$/)
  JWT_ACCESS_EXPIRES_IN!: JwtDuration;

  @IsString()
  @IsNotEmpty()
  JWT_ISSUER!: string;

  @IsString()
  @IsNotEmpty()
  JWT_AUDIENCE!: string;

  @IsString()
  @IsNotEmpty()
  OWNER_PHONE_NUMBER!: string;

  @IsString()
  @MinLength(10)
  OWNER_TEMPORARY_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  OWNER_FIRST_NAME!: string;

  @IsString()
  @IsNotEmpty()
  OWNER_LAST_NAME!: string;

  @IsString()
  @IsNotEmpty()
  MEDIA_STORAGE_PATH!: string;

  @IsInt()
  @Min(1)
  MAX_IMAGE_SIZE_MB!: number;

  @IsInt()
  @Min(1)
  MAX_VIDEO_SIZE_MB!: number;
}

export function validateEnvironment(
  configuration: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfiguration = plainToInstance(
    EnvironmentVariables,
    configuration,
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfiguration, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfiguration;
}
