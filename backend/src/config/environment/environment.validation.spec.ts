import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import {
  validateEnvironment,
  type EnvironmentVariables,
} from './environment.validation';

function createEnvironment(
  overrides: Partial<Record<keyof EnvironmentVariables, unknown>> = {},
): Record<string, unknown> {
  return {
    NODE_ENV: 'development',
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
    ...overrides,
  };
}

describe('validateEnvironment', () => {
  it('accepts the required API, database, and JWT configuration', () => {
    const environment = validateEnvironment(createEnvironment());

    expect(environment.JWT_ACCESS_EXPIRES_IN).toBe('30d');
    expect(environment.FRONTEND_ORIGIN).toBe('http://localhost:3000');
  });

  it('rejects an invalid JWT lifetime', () => {
    expect(() =>
      validateEnvironment(
        createEnvironment({ JWT_ACCESS_EXPIRES_IN: '30 days' }),
      ),
    ).toThrow();
  });

  it('rejects wildcard frontend origins', () => {
    expect(() =>
      validateEnvironment(createEnvironment({ FRONTEND_ORIGIN: '*' })),
    ).toThrow();
  });
});
