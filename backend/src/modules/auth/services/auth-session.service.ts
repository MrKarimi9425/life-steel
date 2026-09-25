import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { AdminStatus } from '../../../generated/prisma/enums';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { REFRESH_TOKEN_LIFETIME_DAYS } from '../constants/auth-token.constants';
import type { AuthenticatedAdmin } from '../types/authenticated-admin.type';

type SessionResult = {
  sessionId: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    adminId: string,
    metadata: { userAgent?: string; ipAddress?: string },
  ): Promise<SessionResult> {
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
    );
    const session = await this.prisma.adminSession.create({
      data: {
        adminId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
        userAgent: metadata.userAgent?.slice(0, 500),
        ipAddress: metadata.ipAddress?.slice(0, 64),
      },
      select: { id: true },
    });

    return { sessionId: session.id, refreshToken, refreshExpiresAt };
  }

  async rotate(
    refreshToken: string,
  ): Promise<SessionResult & { adminId: string }> {
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { admin: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.admin.status !== AdminStatus.ACTIVE ||
      session.admin.deletedAt
    ) {
      throw new UnauthorizedException('نشست معتبر نیست.');
    }

    const nextToken = randomBytes(48).toString('base64url');
    const refreshExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.prisma.adminSession.update({
      where: { id: session.id },
      data: {
        tokenHash: this.hashToken(nextToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      adminId: session.adminId,
      sessionId: session.id,
      refreshToken: nextToken,
      refreshExpiresAt,
    };
  }

  async authenticate(
    sessionId: string,
    adminId: string,
  ): Promise<AuthenticatedAdmin> {
    const session = await this.prisma.adminSession.findFirst({
      where: {
        id: sessionId,
        adminId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        admin: { status: AdminStatus.ACTIVE, deletedAt: null },
      },
      select: {
        admin: {
          select: {
            id: true,
            isOwner: true,
            mustChangePassword: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('نشست معتبر نیست.');
    }

    return {
      adminId: session.admin.id,
      sessionId,
      isOwner: session.admin.isOwner,
      mustChangePassword: session.admin.mustChangePassword,
    };
  }

  async revoke(sessionId: string, adminId: string): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: { id: sessionId, adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAll(adminId: string, exceptSessionId?: string): Promise<void> {
    await this.prisma.adminSession.updateMany({
      where: {
        adminId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
