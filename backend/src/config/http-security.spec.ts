import { describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import type {
  CorsOptions,
  CustomOrigin,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import {
  NodeEnvironment,
  type EnvironmentVariables,
} from './environment/environment.validation';
import { configureHttpSecurity } from './http-security';

interface ConfiguredHttpSecurity {
  enableCors: jest.Mock;
  use: jest.Mock;
  origin: CustomOrigin;
}

function configureSecurity(
  nodeEnvironment = NodeEnvironment.Development,
  frontendOrigin = 'http://localhost:5174',
): ConfiguredHttpSecurity {
  const enableCors = jest.fn();
  const use = jest.fn();
  const values: Pick<EnvironmentVariables, 'FRONTEND_ORIGIN' | 'NODE_ENV'> = {
    FRONTEND_ORIGIN: frontendOrigin,
    NODE_ENV: nodeEnvironment,
  };
  const configService = {
    get: jest.fn((key: keyof typeof values) => values[key]),
  } as unknown as ConfigService<EnvironmentVariables, true>;

  configureHttpSecurity({ enableCors, use }, configService);

  const corsOptions = enableCors.mock.calls[0]?.[0] as CorsOptions | undefined;

  if (typeof corsOptions?.origin !== 'function') {
    throw new Error('Expected a CORS origin validator');
  }

  return { enableCors, use, origin: corsOptions.origin };
}

function expectOrigin(
  originValidator: CustomOrigin,
  origin: string | undefined,
): jest.Mock {
  const callback = jest.fn();

  originValidator(origin, callback);

  return callback;
}

describe('configureHttpSecurity', () => {
  it('configures CORS without credentialed cookie transport', () => {
    const { enableCors } = configureSecurity();

    expect(enableCors).toHaveBeenCalledWith({
      origin: expect.any(Function),
    });
  });

  it('registers the HTTP security middleware', () => {
    const { use } = configureSecurity();

    expect(use).toHaveBeenCalledWith(expect.any(Function));
  });

  it.each([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:8080',
  ])('allows development localhost origin %s', (origin) => {
    const { origin: originValidator } = configureSecurity();

    expect(expectOrigin(originValidator, origin)).toHaveBeenCalledWith(
      null,
      true,
    );
  });

  it.each([
    'http://localhost.example.com:5174',
    'http://evil-localhost.com:5174',
    'http://localhost:99999',
    'https://localhost:5174',
    'https://example.com',
  ])('rejects non-local development origin %s', (origin) => {
    const { origin: originValidator } = configureSecurity();

    expect(expectOrigin(originValidator, origin)).toHaveBeenCalledWith(
      null,
      false,
    );
  });

  it('allows requests without an Origin header', () => {
    const { origin } = configureSecurity();

    expect(expectOrigin(origin, undefined)).toHaveBeenCalledWith(null, true);
  });

  it('allows only the configured origin outside development', () => {
    const trustedOrigin = 'https://panel.example.com';
    const { origin } = configureSecurity(
      NodeEnvironment.Production,
      trustedOrigin,
    );

    expect(expectOrigin(origin, trustedOrigin)).toHaveBeenCalledWith(
      null,
      true,
    );
    expect(expectOrigin(origin, 'http://localhost:5174')).toHaveBeenCalledWith(
      null,
      false,
    );
    expect(expectOrigin(origin, 'https://example.com')).toHaveBeenCalledWith(
      null,
      false,
    );
  });
});
