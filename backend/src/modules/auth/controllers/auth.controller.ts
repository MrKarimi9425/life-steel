import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../../common/http/success-response';
import {
  AUTH_BEARER_SECURITY_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from '../constants/auth-token.constants';
import { AllowPendingPasswordChange } from '../decorators/allow-pending-password.decorator';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { PasswordSignInDto } from '../dto/password-sign-in.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import {
  AuthService,
  type AuthenticationResult,
} from '../services/auth.service';
import type { AuthenticatedAdmin } from '../types/authenticated-admin.type';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('password/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() input: PasswordSignInDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.signIn(input.phoneNumber, input.password, {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });
    this.setRefreshCookie(response, result);

    return createSuccessResponse('با موفقیت وارد شدید.', {
      accessToken: result.accessToken,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readCookie(request, REFRESH_COOKIE_NAME);
    if (!refreshToken) throw new UnauthorizedException('نشست معتبر نیست.');
    const result = await this.auth.refresh(refreshToken);
    this.setRefreshCookie(response, result);
    return createSuccessResponse('نشست تمدید شد.', {
      accessToken: result.accessToken,
    });
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @AllowPendingPasswordChange()
  @ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
  async me(@CurrentAdmin() principal: AuthenticatedAdmin) {
    return createSuccessResponse(
      'اطلاعات حساب دریافت شد.',
      await this.auth.getCurrentAdmin(principal.adminId),
    );
  }

  @Post('password/change')
  @UseGuards(AccessTokenGuard)
  @AllowPendingPasswordChange()
  @ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
  async changePassword(
    @CurrentAdmin() principal: AuthenticatedAdmin,
    @Body() input: ChangePasswordDto,
  ) {
    await this.auth.changePassword(
      principal.adminId,
      principal.sessionId,
      input.currentPassword,
      input.newPassword,
    );
    return createSuccessResponse('رمز عبور تغییر کرد.', null);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @AllowPendingPasswordChange()
  @ApiBearerAuth(AUTH_BEARER_SECURITY_NAME)
  async logout(
    @CurrentAdmin() principal: AuthenticatedAdmin,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(principal.adminId, principal.sessionId);
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: REFRESH_COOKIE_PATH,
    });
    return createSuccessResponse('با موفقیت خارج شدید.', null);
  }

  private setRefreshCookie(
    response: Response,
    result: AuthenticationResult,
  ): void {
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: REFRESH_COOKIE_PATH,
      expires: result.refreshExpiresAt,
    });
  }

  private readCookie(request: Request, name: string): string | null {
    for (const part of request.headers.cookie?.split(';') ?? []) {
      const [cookieName, ...valueParts] = part.split('=');
      if (cookieName?.trim() === name) {
        try {
          return decodeURIComponent(valueParts.join('=').trim());
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
