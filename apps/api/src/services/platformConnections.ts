import { prisma } from '../db/prisma.js';

export type Platform = 'facebook' | 'instagram' | 'google';

export interface SaveAccountInput {
  userId: string;
  platform: Platform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string | undefined;
  tokenExpiry?: Date | undefined;
}

export async function saveAccount(input: SaveAccountInput) {
  return prisma.platformAccount.upsert({
    where: {
      userId_platform_accountId: {
        userId: input.userId,
        platform: input.platform,
        accountId: input.accountId,
      },
    },
    update: {
      accountName: input.accountName,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiry: input.tokenExpiry ?? null,
    },
    create: {
      userId: input.userId,
      platform: input.platform,
      accountId: input.accountId,
      accountName: input.accountName,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiry: input.tokenExpiry ?? null,
    },
  });
}

export async function getAccountsByUser(userId: string, platform?: string) {
  return prisma.platformAccount.findMany({
    where: {
      userId,
      ...(platform ? { platform } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      platform: true,
      accountId: true,
      accountName: true,
      tokenExpiry: true,
      createdAt: true,
    },
  });
}

export async function deleteAccount(id: string, userId: string) {
  return prisma.platformAccount.deleteMany({
    where: { id, userId },
  });
}
