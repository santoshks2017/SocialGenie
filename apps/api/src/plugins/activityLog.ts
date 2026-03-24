import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';

// Actions to log: map [method, urlPattern] → action name
const ACTION_MAP: Array<{ method: string; pattern: RegExp; action: string; entityType?: string }> = [
  { method: 'POST',   pattern: /\/v1\/publisher\/publish$/,    action: 'post.publish',      entityType: 'post' },
  { method: 'POST',   pattern: /\/v1\/publisher\/schedule$/,   action: 'post.schedule',     entityType: 'post' },
  { method: 'DELETE', pattern: /\/v1\/publisher\/[^/]+$/,      action: 'post.delete',       entityType: 'post' },
  { method: 'POST',   pattern: /\/v1\/boost$/,                 action: 'boost.create',      entityType: 'boost_campaign' },
  { method: 'POST',   pattern: /\/v1\/boost\/[^/]+\/pause$/,   action: 'boost.pause',       entityType: 'boost_campaign' },
  { method: 'POST',   pattern: /\/v1\/boost\/[^/]+\/resume$/,  action: 'boost.resume',      entityType: 'boost_campaign' },
  { method: 'POST',   pattern: /\/v1\/boost\/[^/]+\/stop$/,    action: 'boost.stop',        entityType: 'boost_campaign' },
  { method: 'POST',   pattern: /\/v1\/leads$/,                 action: 'lead.create',       entityType: 'lead' },
  { method: 'POST',   pattern: /\/v1\/inbox\/[^/]+\/reply$/,   action: 'inbox.reply',       entityType: 'inbox_message' },
  { method: 'POST',   pattern: /\/v1\/platforms\/[^/]+\/connect$/, action: 'platform.connect', entityType: 'platform_connection' },
  { method: 'DELETE', pattern: /\/v1\/platforms\/[^/]+$/,      action: 'platform.disconnect', entityType: 'platform_connection' },
  { method: 'POST',   pattern: /\/v1\/inventory$/,             action: 'inventory.create',  entityType: 'inventory_item' },
  { method: 'DELETE', pattern: /\/v1\/inventory\/[^/]+$/,      action: 'inventory.delete',  entityType: 'inventory_item' },
  { method: 'PATCH',  pattern: /\/v1\/dealer$/,                action: 'dealer.update',     entityType: 'dealer' },
];

export async function registerActivityLog(fastify: FastifyInstance) {
  fastify.addHook('onResponse', async (request, reply) => {
    // Only log successful mutating actions for authenticated users
    if (!request.user) return;
    if (reply.statusCode >= 400) return;

    const method = request.method.toUpperCase();
    const url = request.url.split('?')[0];

    const match = ACTION_MAP.find((a) => a.method === method && a.pattern.test(url));
    if (!match) return;

    const user = request.user as { dealer_user_id: string; dealer_id: string | null };
    const dealer_id = user.dealer_id;
    if (!dealer_id) return; // owner acting globally — skip per-org log here

    // Extract entity_id from URL path (last segment if it looks like a UUID)
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const entity_id = uuidPattern.test(lastSegment) ? lastSegment : undefined;

    try {
      await prisma.activityLog.create({
        data: {
          dealer_id,
          dealer_user_id: user.dealer_user_id ?? null,
          action: match.action,
          entity_type: match.entityType ?? null,
          entity_id: entity_id ?? null,
          ip_address: request.ip,
          user_agent: request.headers['user-agent'] ?? null,
        },
      });
    } catch {
      // Non-critical — don't fail the request if logging fails
      fastify.log.warn(`Failed to write activity log for action ${match.action}`);
    }
  });
}
