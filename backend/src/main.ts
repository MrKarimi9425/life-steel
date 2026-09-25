import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'node:path';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApiRouting } from './config/api-routing';
import { configureApiResponses } from './config/api-responses';
import { EnvironmentVariables } from './config/environment/environment.validation';
import { configureHttpSecurity } from './config/http-security';
import { createSwaggerDocument } from './swagger/swagger-document';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  const configService = app.get(ConfigService<EnvironmentVariables, true>);

  configureHttpSecurity(app, configService);
  configureApiRouting(app);
  configureApiResponses(app);
  app.useStaticAssets(
    resolve(
      process.cwd(),
      configService.getOrThrow<string>('MEDIA_STORAGE_PATH'),
    ),
    {
      prefix: '/api/public/media/',
    },
  );

  const swaggerDocument = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(configService.get('PORT', { infer: true }));
}

void bootstrap();
