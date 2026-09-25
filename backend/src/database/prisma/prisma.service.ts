import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

const DATABASE_CONNECTION_MAX_ATTEMPTS = 5;
const DATABASE_CONNECTION_RETRY_DELAY_MS = 1_000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const adapter = new PrismaMariaDb(
      configService.getOrThrow<string>('DATABASE_URL'),
    );

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.waitForDatabase();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async waitForDatabase(): Promise<void> {
    for (
      let attempt = 1;
      attempt <= DATABASE_CONNECTION_MAX_ATTEMPTS;
      attempt += 1
    ) {
      try {
        await this.$queryRaw`SELECT 1`;
        this.logger.log('Database connection is ready.');
        return;
      } catch (error) {
        if (attempt === DATABASE_CONNECTION_MAX_ATTEMPTS) {
          throw error;
        }

        this.logger.warn(
          `Database is not ready (attempt ${attempt}/${DATABASE_CONNECTION_MAX_ATTEMPTS}). Retrying in ${DATABASE_CONNECTION_RETRY_DELAY_MS}ms.`,
        );
        await new Promise<void>((resolve) =>
          setTimeout(resolve, DATABASE_CONNECTION_RETRY_DELAY_MS),
        );
      }
    }
  }
}
