import type { FastifyInstance } from 'fastify';
import { saveAccount, getAccountsByUser, deleteAccount } from '../services/platformConnections.js';
import type { Platform } from '../services/platformConnections.js';

const VALID_PLATFORMS = new Set(['facebook', 'instagram', 'google']);

interface SaveAccountBody {
  userId?: string;
  platform?: string;
  accountId?: string;
  accountName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
}

export default async function platformAccountRoutes(fastify: FastifyInstance) {
  // GET /v1/platform-accounts — list all connected accounts for logged-in user
  fastify.get('/', async (request, reply) => {
    const { platform } = request.query as { platform?: string };

    if (platform && !VALID_PLATFORMS.has(platform)) {
      return reply.code(400).send({ error: `Invalid platform filter. Must be one of: ${[...VALID_PLATFORMS].join(', ')}` });
    }

    // Use authenticated user if available, fallback to test-dealer
    const userId = (request as unknown as { user?: { dealer_id?: string } }).user?.dealer_id ?? 'test-dealer';

    try {
      const accounts = await getAccountsByUser(userId, platform);
      return { success: true, accounts };
    } catch (err) {
      fastify.log.error(`Failed to list platform accounts: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to list platform accounts' });
    }
  });

  // POST /v1/platform-accounts — save or update an account
  fastify.post('/', async (request, reply) => {
    const body = request.body as SaveAccountBody | undefined;

    if (!body || !body.userId || !body.platform || !body.accountId || !body.accountName || !body.accessToken) {
      return reply.code(400).send({
        error: 'Missing required fields: userId, platform, accountId, accountName, accessToken',
      });
    }

    if (!VALID_PLATFORMS.has(body.platform)) {
      return reply.code(400).send({ error: `Invalid platform. Must be one of: ${[...VALID_PLATFORMS].join(', ')}` });
    }

    try {
      const account = await saveAccount({
        userId: body.userId,
        platform: body.platform as Platform,
        accountId: body.accountId,
        accountName: body.accountName,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        tokenExpiry: body.tokenExpiry ? new Date(body.tokenExpiry) : undefined,
      });

      return { success: true, account };
    } catch (err) {
      fastify.log.error(`Failed to save platform account: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to save platform account' });
    }
  });

  // GET /v1/platform-accounts/:userId — get all accounts for a user
  fastify.get('/:userId', async (request, reply) => {
    const { userId } = request.params as { userId?: string };
    if (!userId) return reply.code(400).send({ error: 'Missing userId' });

    try {
      const accounts = await getAccountsByUser(userId);
      return { success: true, accounts };
    } catch (err) {
      fastify.log.error(`Failed to fetch platform accounts: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to fetch platform accounts' });
    }
  });

  // DELETE /v1/platform-accounts/:id — delete an account
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id?: string };
    const body = request.body as { userId?: string } | undefined;
    const userId = body?.userId;

    if (!id || !userId) return reply.code(400).send({ error: 'Missing id or userId' });

    try {
      await deleteAccount(id, userId);
      return { success: true };
    } catch (err) {
      fastify.log.error(`Failed to delete platform account: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to delete platform account' });
    }
  });
}
