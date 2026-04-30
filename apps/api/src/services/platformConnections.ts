import { prisma } from '../db/prisma.js';

export type Platform = 'facebook' | 'instagram' | 'google' | 'gmb';

export interface SaveAccountInput {
  userId: string; // maps to dealer_id on PlatformConnection
  platform: Platform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string | undefined;
  tokenExpiry?: Date | undefined;
}

export async function saveAccount(input: SaveAccountInput) {
  const platform = input.platform === 'google' ? 'gmb' : input.platform;
  return prisma.platformConnection.upsert({
    where: {
      dealer_id_platform: {
        dealer_id: input.userId,
        platform,
      },
    },
    update: {
      platform_account_id: input.accountId,
      platform_account_name: input.accountName,
      access_token: input.accessToken,
      refresh_token: input.refreshToken ?? null,
      token_expires_at: input.tokenExpiry ?? null,
      is_connected: true,
    },
    create: {
      dealer_id: input.userId,
      platform,
      platform_account_id: input.accountId,
      platform_account_name: input.accountName,
      access_token: input.accessToken,
      refresh_token: input.refreshToken ?? null,
      token_expires_at: input.tokenExpiry ?? null,
      is_connected: true,
    },
  });
}

export async function getAccountsByUser(userId: string, platform?: string) {
  const normalizedPlatform = platform === 'google' ? 'gmb' : platform;
  const connections = await prisma.platformConnection.findMany({
    where: {
      dealer_id: userId,
      is_connected: true,
      ...(normalizedPlatform ? { platform: normalizedPlatform } : {}),
    },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      platform: true,
      platform_account_id: true,
      platform_account_name: true,
      token_expires_at: true,
      created_at: true,
    },
  });

  return connections.map((c) => ({
    id: c.id,
    platform: c.platform,
    accountId: c.platform_account_id,
    accountName: c.platform_account_name ?? '',
    tokenExpiry: c.token_expires_at?.toISOString() ?? null,
    createdAt: c.created_at.toISOString(),
  }));
}

export async function deleteAccount(id: string, userId: string) {
  return prisma.platformConnection.updateMany({
    where: { id, dealer_id: userId },
    data: { is_connected: false },
  });
}
