import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AdminStatus } from '../../../generated/prisma/client';
import { normalizePhoneNumber } from '../../../common/utils/phone-number.util';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AuthSessionService } from '../../auth/services/auth-session.service';
import { PasswordHasher } from '../../auth/services/password-hasher';
import type { CreateAdminDto } from '../dto/create-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: AuthSessionService,
  ) {}

  list() {
    return this.prisma.admin.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isOwner: true,
        mustChangePassword: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [{ isOwner: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(input: CreateAdminDto) {
    const phoneNumber = normalizePhoneNumber(input.phoneNumber);
    const existing = await this.prisma.admin.findUnique({
      where: { phoneNumber },
    });
    if (existing)
      throw new ConflictException('این شماره تلفن قبلا ثبت شده است.');

    const temporaryPassword = this.generateTemporaryPassword();
    const admin = await this.prisma.admin.create({
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phoneNumber,
        passwordHash: await this.passwordHasher.hash(temporaryPassword),
        mustChangePassword: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        status: true,
      },
    });

    return { admin, temporaryPassword };
  }

  async updateStatus(id: string, status: AdminStatus) {
    const admin = await this.findMutableAdmin(id);
    if (admin.status === status) return;
    await this.prisma.admin.update({ where: { id }, data: { status } });
    if (status === AdminStatus.DISABLED) await this.sessions.revokeAll(id);
  }

  async resetPassword(id: string) {
    await this.findMutableAdmin(id);
    const temporaryPassword = this.generateTemporaryPassword();
    await this.prisma.admin.update({
      where: { id },
      data: {
        passwordHash: await this.passwordHasher.hash(temporaryPassword),
        mustChangePassword: true,
        passwordChangedAt: new Date(),
      },
    });
    await this.sessions.revokeAll(id);
    return { temporaryPassword };
  }

  private async findMutableAdmin(id: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { id, deletedAt: null },
    });
    if (!admin) throw new NotFoundException('ادمین پیدا نشد.');
    if (admin.isOwner) {
      throw new BadRequestException('حساب مدیر اصلی قابل تغییر نیست.');
    }
    return admin;
  }

  private generateTemporaryPassword(): string {
    return `Ls!${randomBytes(9).toString('base64url')}`;
  }
}
