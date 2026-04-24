import type { FastifyInstance } from 'fastify';
import { saveAccount, getAccountsByUser, deleteAccount } from '../services/platformConnections.js';
import type { Platform } from '../services/platformConnections.js';

const VALID_PLATFORMS = new Set(['facebook', 'instagram', 'google']);

interface SaveAccountBody {
  platform?: string;
  accountId?: string;
  accountName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
}

export default async function platformAccountRoutes(fastify: FastifyInstance) {
  // GET /v1/platform-accounts — list connected accounts for the authenticated dealer
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { platform } = request.query as { platform?: string };

    if (platform && !VALID_PLATFORMS.has(platform)) {
      return reply.code(400).send({
        error: `Invalid platform filter. Must be one of: ${[...VALID_PLATFORMS].join(', ')}`,
      });
    }

    const userId = request.user.dealer_id ?? 'anonymous';

    try {
      const accounts = await getAccountsByUser(userId, platform);
      return { success: true, accounts };
    } catch (err) {
      fastify.log.error(err, '[PlatformAccounts] Failed to list accounts');
      return reply.code(500).send({ error: 'Failed to list platform accounts' });
    }
  });

  // POST /v1/platform-accounts — manually save or update a platform account
  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const body = request.body as SaveAccountBody | undefined;

    if (!body || !body.platform || !body.accountId || !body.accountName || !body.accessToken) {
      return reply.code(400).send({
        error: 'Missing required fields: platform, accountId, accountName, accessToken',
      });
    }

    if (!VALID_PLATFORMS.has(body.platform)) {
      return reply.code(400).send({
        error: `Invalid platform. Must be one of: ${[...VALID_PLATFORMS].join(', ')}`,
      });
    }

    const userId = request.user.dealer_id ?? 'anonymous';

    try {
      const account = await saveAccount({
        userId,
        platform: body.platform as Platform,
        accountId: body.accountId,
        accountName: body.accountName,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        tokenExpiry: body.tokenExpiry ? new Date(body.tokenExpiry) : undefined,
      });

      fastify.log.info(`[PlatformAccounts] Saved ${body.platform} account ${body.accountId} for dealer=${userId}`);
      return { success: true, account };
    } catch (err) {
      fastify.log.error(err, '[PlatformAccounts] Failed to save account');
      return reply.code(500).send({ error: 'Failed to save platform account' });
    }
  });

  // DELETE /v1/platform-accounts/:id — disconnect a platform account
  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: 'Missing account id' });
    }

    const userId = request.user.dealer_id ?? 'anonymous';

    try {
      await deleteAccount(id, userId);
      fastify.log.info(`[PlatformAccounts] Deleted account ${id} for dealer=${userId}`);
      return { success: true };
    } catch (err) {
      fastify.log.error(err, '[PlatformAccounts] Failed to delete account');
      return reply.code(500).send({ error: 'Failed to delete platform account' });
    }
  });
}
