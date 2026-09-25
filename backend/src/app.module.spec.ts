import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { PrismaService } from './database/prisma/prisma.service';

const requiredEnvironment = {
  NODE_ENV: 'test',
  PORT: '3000',
  FRONTEND_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'mysql://user:password@localhost:3306/life_steel',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_ACCESS_EXPIRES_IN: '30d',
  JWT_ISSUER: 'life-steel-backend',
  JWT_AUDIENCE: 'life-steel-admin',
  OWNER_PHONE_NUMBER: '09120000000',
  OWNER_TEMPORARY_PASSWORD: 'Temporary!123',
  OWNER_FIRST_NAME: 'مدیر',
  OWNER_LAST_NAME: 'سیستم',
  MEDIA_STORAGE_PATH: 'storage/media',
  MAX_IMAGE_SIZE_MB: '15',
  MAX_VIDEO_SIZE_MB: '250',
} as const;

describe('AppModule dependency graph', () => {
  it('resolves exported authentication guards in protected feature modules', async () => {
    const originalEnvironment = new Map<string, string | undefined>();

    for (const [key, value] of Object.entries(requiredEnvironment)) {
      originalEnvironment.set(key, process.env[key]);
      process.env[key] = value;
    }

    try {
      const { AppModule } = await import('./app.module');
      const module = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue({ $connect: (): Promise<void> => Promise.resolve() })
        .compile();

      expect(module).toBeDefined();
      await module.close();
    } finally {
      for (const [key, value] of originalEnvironment) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });
});
