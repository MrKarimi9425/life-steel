import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError, ErrorFields, ErrorResponse } from './error-response';

const statusCodes: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_REQUIRED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
};

const statusMessages: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'درخواست ارسال شده معتبر نیست.',
  [HttpStatus.UNAUTHORIZED]: 'برای ادامه دوباره وارد حساب کاربری شوید.',
  [HttpStatus.FORBIDDEN]: 'اجازه انجام این عملیات را ندارید.',
  [HttpStatus.NOT_FOUND]: 'اطلاعات درخواستی پیدا نشد.',
  [HttpStatus.CONFLICT]: 'انجام این عملیات با وضعیت فعلی امکان پذیر نیست.',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'اطلاعات ارسال شده معتبر نیست.',
  [HttpStatus.TOO_MANY_REQUESTS]:
    'تعداد درخواست ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logServerError(exception);
    }

    response.status(status).json({
      error: this.createError(exception, status),
    } satisfies ErrorResponse);
  }

  private logServerError(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      return;
    }

    this.logger.error('Unhandled non-Error exception');
  }

  private createError(exception: unknown, status: number): ApiError {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'خطایی در سرور رخ داد. کمی بعد دوباره تلاش کنید.',
      };
    }

    const exceptionResponse = exception.getResponse();

    if (this.isRecord(exceptionResponse)) {
      const code = this.readString(exceptionResponse.code);
      const fields = this.readFields(
        exceptionResponse.fields ?? exceptionResponse.errors,
      );
      const message = this.readPersianMessage(exceptionResponse.message);

      if (fields) {
        return {
          code: code ?? 'VALIDATION_ERROR',
          fields,
        };
      }

      if (message) {
        return {
          code: code ?? this.getStatusCode(status),
          message,
        };
      }
    }

    if (typeof exceptionResponse === 'string') {
      const message = this.readPersianMessage(exceptionResponse);

      if (message) {
        return { code: this.getStatusCode(status), message };
      }
    }

    return {
      code: this.getStatusCode(status),
      message: this.getStatusMessage(status),
    };
  }

  private getStatusCode(status: number): string {
    return (
      statusCodes[status] ??
      (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED')
    );
  }

  private getStatusMessage(status: number): string {
    if (status >= 500) {
      return 'خطایی در سرور رخ داد. کمی بعد دوباره تلاش کنید.';
    }

    return statusMessages[status] ?? 'انجام درخواست با خطا مواجه شد.';
  }

  private readPersianMessage(value: unknown): string | undefined {
    const message = this.readString(value);

    return message && /[\u0600-\u06ff]/u.test(message) ? message : undefined;
  }

  private readFields(value: unknown): ErrorFields | undefined {
    if (!this.isRecord(value)) return undefined;

    const fields = Object.entries(value).reduce<ErrorFields>(
      (result, [field, message]) => {
        const normalizedMessage = Array.isArray(message)
          ? this.readString(message[0])
          : this.readString(message);

        if (normalizedMessage) {
          result[field] = /[\u0600-\u06ff]/u.test(normalizedMessage)
            ? normalizedMessage
            : 'مقدار این فیلد معتبر نیست.';
        }
        return result;
      },
      {},
    );

    return Object.keys(fields).length > 0 ? fields : undefined;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
