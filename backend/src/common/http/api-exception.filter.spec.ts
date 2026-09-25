import {
  BadRequestException,
  ConflictException,
  Logger,
  type ArgumentsHost,
} from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  it('returns only fields for a form error', () => {
    const { filter, json, host } = createFilterContext();

    filter.catch(
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        fields: { phoneNumber: 'شماره موبایل معتبر نیست.' },
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        fields: { phoneNumber: 'شماره موبایل معتبر نیست.' },
      },
    });
  });

  it('returns only one message for a general error', () => {
    const { filter, json, host } = createFilterContext();

    filter.catch(
      new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'شماره موبایل یا کلمه عبور اشتباه است.',
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'شماره موبایل یا کلمه عبور اشتباه است.',
      },
    });
  });

  it('replaces an English exception message with a Persian status message', () => {
    const { filter, json, host } = createFilterContext();

    filter.catch(new ConflictException('Resource already exists'), host);

    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'انجام این عملیات با وضعیت فعلی امکان پذیر نیست.',
      },
    });
  });

  it('logs an unexpected server error while returning the safe response', () => {
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { filter, json, host } = createFilterContext();
    const exception = new Error('Database schema mismatch');

    filter.catch(exception, host);

    expect(logError).toHaveBeenCalledWith(exception.message, exception.stack);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'خطایی در سرور رخ داد. کمی بعد دوباره تلاش کنید.',
      },
    });

    logError.mockRestore();
  });
});

type FilterContext = {
  filter: ApiExceptionFilter;
  host: ArgumentsHost;
  json: jest.MockedFunction<(body: unknown) => void>;
};

function createFilterContext(): FilterContext {
  const json = jest.fn<(body: unknown) => void>();
  const status = jest.fn((): { json: typeof json } => ({ json }));
  const host = {
    switchToHttp: (): { getResponse: () => { status: typeof status } } => ({
      getResponse: (): { status: typeof status } => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { filter: new ApiExceptionFilter(), host, json };
}
