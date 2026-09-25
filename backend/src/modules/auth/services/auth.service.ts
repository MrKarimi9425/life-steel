import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminStatus } from '../../../generated/prisma/client';
import { normalizePhoneNumber } from '../../../common/utils/phone-number.util';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AuthSessionService } from './auth-session.service';
import { PasswordHasher } from './password-hasher';
import { TokenService } from './token.service';

export type AuthenticationResult = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: AuthSessionService,
    private readonly tokens: TokenService,
  ) {}

  async signIn(
    phoneNumber: string,
    password: string,
    metadata: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthenticationResult> {
    const admin = await this.prisma.admin.findUnique({
      where: { phoneNumber: normalizePhoneNumber(phoneNumber) },
    });

    if (
      !admin ||
      admin.deletedAt ||
      !(await this.passwordHasher.verify(admin.passwordHash, password))
    ) {
      throw new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'شماره موبایل یا کلمه عبور اشتباه است.',
      });
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      throw new ForbiddenException('حساب کاربری غیر فعال است.');
    }

    const session = await this.sessions.create(admin.id, metadata);
    const accessToken = await this.tokens.issue(admin.id, session.sessionId);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return { accessToken, ...session };
  }

  async refresh(refreshToken: string): Promise<AuthenticationResult> {
    const session = await this.sessions.rotate(refreshToken);
    const accessToken = await this.tokens.issue(
      session.adminId,
      session.sessionId,
    );

    return { accessToken, ...session };
  }

  async logout(adminId: string, sessionId: string): Promise<void> {
    await this.sessions.revoke(sessionId, adminId);
  }

  async changePassword(
    adminId: string,
    sessionId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'رمز عبور جدید باید با رمز فعلی متفاوت باشد.',
      );
    }

    const admin = await this.prisma.admin.findUniqueOrThrow({
      where: { id: adminId },
    });

    if (
      !(await this.passwordHasher.verify(admin.passwordHash, currentPassword))
    ) {
      throw new BadRequestException('رمز عبور فعلی صحیح نیست.');
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.admin.update({
        where: { id: adminId },
        data: {
          passwordHash,
          mustChangePassword: false,
          passwordChangedAt: new Date(),
        },
      }),
      this.prisma.adminSession.updateMany({
        where: { adminId, id: { not: sessionId }, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async getCurrentAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUniqueOrThrow({
      where: { id: adminId },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        isOwner: true,
        mustChangePassword: true,
      },
    });

    return {
      userId: admin.id,
      phoneNumber: admin.phoneNumber,
      role: admin.isOwner ? 'OWNER' : 'ADMIN',
      accountType: 'STAFF' as const,
      permissions: admin.isOwner ? ['OWNER'] : [],
      hasPassword: true,
      isOwner: admin.isOwner,
      mustChangePassword: admin.mustChangePassword,
      profile: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatarPath: null,
      },
    };
  }
}
