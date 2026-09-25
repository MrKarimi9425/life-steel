import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ApiExceptionFilter } from '../common/http/api-exception.filter';
import { BigIntSerializationInterceptor } from '../common/http/bigint-serialization.interceptor';
import { createValidationException } from '../common/http/validation-error';

export function configureApiResponses(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: createValidationException,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
}
