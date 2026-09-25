import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ALLOW_PENDING_PASSWORD_KEY } from '../decorators/allow-pending-password.decorator';
import { AuthSessionService } from '../services/auth-session.service';
import { TokenService } from '../services/token.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly sessions: AuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.readBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('ورود به حساب کاربری الزامی است.');
    }

    try {
      const claims = await this.tokenService.verify(token);
      const admin = await this.sessions.authenticate(
        claims.sessionId,
        claims.adminId,
      );
      (request as AuthenticatedRequest).admin = admin;

      const allowPending = this.reflector.getAllAndOverride<boolean>(
        ALLOW_PENDING_PASSWORD_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (admin.mustChangePassword && !allowPending) {
        throw new ForbiddenException({
          code: 'PASSWORD_CHANGE_REQUIRED',
          message: 'تغییر رمز عبور پیش از ادامه الزامی است.',
        });
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('نشست معتبر نیست.');
    }
  }

  private readBearerToken(request: Request): string | null {
    const [scheme, token, extra] =
      request.headers.authorization?.trim().split(/\s+/) ?? [];

    return scheme?.toLowerCase() === 'bearer' && token && !extra ? token : null;
  }
}
