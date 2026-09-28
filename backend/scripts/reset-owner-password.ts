import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { randomBytes } from 'node:crypto';
import { normalizePhoneNumber } from '../src/common/utils/phone-number.util';
import { PrismaClient } from '../src/generated/prisma/client';
import { PasswordHasher } from '../src/modules/auth/services/password-hasher';

const DEVELOPMENT_ENVIRONMENT = 'development';

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function generateTemporaryPassword(): string {
  return `Ls!${randomBytes(18).toString('base64url')}`;
}

async function resetOwnerPassword(): Promise<void> {
  const environment = getRequiredEnvironmentVariable('NODE_ENV');
  if (environment !== DEVELOPMENT_ENVIRONMENT) {
    throw new Error('Owner password reset is only available in development.');
  }

  const databaseUrl = getRequiredEnvironmentVariable('DATABASE_URL');
  const ownerPhoneNumber = normalizePhoneNumber(
    getRequiredEnvironmentVariable('OWNER_PHONE_NUMBER'),
  );
  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  const passwordHasher = new PasswordHasher();

  try {
    const owner = await prisma.admin.findUnique({
      where: { phoneNumber: ownerPhoneNumber },
      select: {
        id: true,
        isOwner: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!owner || !owner.isOwner || owner.deletedAt) {
      throw new Error('The configured active owner account was not found.');
    }
    if (owner.status !== 'ACTIVE') {
      throw new Error('The configured owner account is disabled.');
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await passwordHasher.hash(temporaryPassword);

    await prisma.$transaction([
      prisma.admin.update({
        where: { id: owner.id },
        data: {
          passwordHash,
          mustChangePassword: true,
          passwordChangedAt: new Date(),
        },
      }),
      prisma.adminSession.updateMany({
        where: { adminId: owner.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    console.log('Owner password was reset successfully.');
    console.log(`Phone number: ${ownerPhoneNumber}`);
    console.log(`Temporary password: ${temporaryPassword}`);
    console.log('Change this password immediately after signing in.');
  } finally {
    await prisma.$disconnect();
  }
}

void resetOwnerPassword().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unknown error.');
  process.exitCode = 1;
});
