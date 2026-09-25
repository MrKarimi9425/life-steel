import { ConfigService } from '@nestjs/config';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { NextFunction, Request, Response } from 'express';
import {
  NodeEnvironment,
  type EnvironmentVariables,
} from './environment/environment.validation';

type HttpSecurityApplication = {
  enableCors(options: { origin: CustomOrigin }): unknown;
  use(
    middleware: (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => void,
  ): unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const AUTH_RATE_LIMIT_WINDOW_MILLISECONDS = 15 * 60 * 1000;
const authRateLimits = new Map<string, number>([
  ['/api/v1/auth/password/sign-in', 10],
  ['/api/v1/auth/password/change', 10],
]);

function isDevelopmentLocalhostOrigin(origin: string): boolean {
  try {
    const parsedOrigin = new URL(origin);

    return (
      parsedOrigin.protocol === 'http:' &&
      parsedOrigin.hostname === 'localhost' &&
      parsedOrigin.origin === origin
    );
  } catch {
    return false;
  }
}

function createCorsOriginValidator(
  nodeEnvironment: NodeEnvironment,
  frontendOrigin: string,
): CustomOrigin {
  return (requestOrigin, callback) => {
    if (requestOrigin === undefined) {
      callback(null, true);
      return;
    }

    const isAllowed =
      nodeEnvironment === NodeEnvironment.Development
        ? isDevelopmentLocalhostOrigin(requestOrigin)
        : requestOrigin === frontendOrigin;

    callback(null, isAllowed);
  };
}

export function configureHttpSecurity(
  app: HttpSecurityApplication,
  configService: ConfigService<EnvironmentVariables, true>,
): void {
  const nodeEnvironment = configService.get('NODE_ENV', { infer: true });
  const frontendOrigin = configService.get('FRONTEND_ORIGIN', { infer: true });

  app.enableCors({
    origin: createCorsOriginValidator(nodeEnvironment, frontendOrigin),
  });
  app.use(createSecurityMiddleware(nodeEnvironment));
}

function createSecurityMiddleware(
  nodeEnvironment: NodeEnvironment,
): (request: Request, response: Response, next: NextFunction) => void {
  const rateLimitEntries = new Map<string, RateLimitEntry>();

  return (request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader(
      'Permissions-Policy',
      'camera=(), geolocation=(), microphone=()',
    );

    if (nodeEnvironment === NodeEnvironment.Production) {
      response.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    const requestLimit =
      request.method === 'POST' ? authRateLimits.get(request.path) : undefined;

    if (requestLimit === undefined) {
      next();
      return;
    }

    const currentTime = Date.now();
    const clientAddress =
      request.ip || request.socket.remoteAddress || 'unknown';
    const key = `${clientAddress}:${request.path}`;
    const currentEntry = rateLimitEntries.get(key);
    const entry =
      !currentEntry || currentEntry.resetAt <= currentTime
        ? {
            count: 0,
            resetAt: currentTime + AUTH_RATE_LIMIT_WINDOW_MILLISECONDS,
          }
        : currentEntry;

    entry.count += 1;
    rateLimitEntries.set(key, entry);

    if (entry.count > requestLimit) {
      const retryAfterSeconds = Math.max(
        Math.ceil((entry.resetAt - currentTime) / 1000),
        1,
      );
      response.setHeader('Retry-After', retryAfterSeconds.toString());
      response.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message:
            'تعداد درخواست ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
        },
      });
      return;
    }

    next();
  };
}
