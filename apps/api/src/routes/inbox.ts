import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';
import type { InboxMessage } from '../generated/client/index.js';

function mapMessage(m: InboxMessage) {
  return {
    id: m.id,
    dealerId: m.dealer_id,
    platform: m.platform,
    messageType: m.message_type,
    platformMessageId: m.platform_message_id,
    postId: m.post_id ?? undefined,
    customerName: m.customer_name,
    customerAvatarUrl: m.customer_avatar_url ?? undefined,
    customerPlatformId: m.customer_platform_id ?? undefined,
    messageText: m.message_text,
    sentiment: m.sentiment ?? undefined,
    tag: m.tag ?? undefined,
    aiSuggestedReply: m.ai_suggested_reply ?? undefined,
    replyText: m.reply_text ?? undefined,
    repliedAt: m.replied_at?.toISOString() ?? undefined,
    isRead: m.is_read,
    requiresApproval: m.requires_approval,
    receivedAt: m.received_at.toISOString(),
  };
}

export default async function inboxRoutes(fastify: FastifyInstance) {
  // GET /v1/inbox — list messages
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    const { platform, tag, isRead, search, page = '1', pageSize = '30' } = request.query as Record<string, string>;

    const where: Record<string, unknown> = { dealer_id };
    if (platform) where['platform'] = platform;
    if (tag) where['tag'] = tag;
    if (isRead !== undefined) where['is_read'] = isRead === 'true';
    if (search) where['message_text'] = { contains: search, mode: 'insensitive' };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const [messages, total, unreadCount] = await Promise.all([
      prisma.inboxMessage.findMany({
        where,
        orderBy: { received_at: 'desc' },
        skip,
        take: parseInt(pageSize),
      }),
      prisma.inboxMessage.count({ where }),
      prisma.inboxMessage.count({ where: { dealer_id, is_read: false } }),
    ]);

    return { items: messages.map(mapMessage), total, unreadCount };
  });

  // GET /v1/inbox/:id — single message
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    const { id } = request.params as { id: string };
    const message = await prisma.inboxMessage.findFirst({ where: { id, dealer_id } });
    if (!message) return reply.code(404).send({ error: 'Not found' });
    return { item: mapMessage(message) };
  });

  // PATCH /v1/inbox/:id — mark read or update tag
  fastify.patch('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    const { id } = request.params as { id: string };
    const body = request.body as { isRead?: boolean; tag?: string };

    const update: Record<string, unknown> = {};
    if (body.isRead !== undefined) update['is_read'] = body.isRead;
    if (body.tag !== undefined) update['tag'] = body.tag;

    const message = await prisma.inboxMessage.updateMany({
      where: { id, dealer_id },
      data: update,
    });
    if (message.count === 0) return reply.code(404).send({ error: 'Not found' });

    const updated = await prisma.inboxMessage.findFirst({ where: { id } });
    return { item: mapMessage(updated!) };
  });

  // POST /v1/inbox/mark-all-read
  fastify.post('/mark-all-read', { preHandler: [fastify.authenticate] }, async (request) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    await prisma.inboxMessage.updateMany({ where: { dealer_id, is_read: false }, data: { is_read: true } });
    return { success: true };
  });

  // POST /v1/inbox/:id/reply — send reply
  fastify.post('/:id/reply', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    const { id } = request.params as { id: string };
    const { replyText } = request.body as { replyText: string };
    if (!replyText) return reply.code(400).send({ error: 'replyText is required' });

    const repliedAt = new Date();
    const message = await prisma.inboxMessage.updateMany({
      where: { id, dealer_id },
      data: { reply_text: replyText, replied_at: repliedAt },
    });
    if (message.count === 0) return reply.code(404).send({ error: 'Not found' });

    // TODO: call Meta Graph API / GMB API to post the reply on the platform

    const updated = await prisma.inboxMessage.findFirst({ where: { id } });
    return { item: mapMessage(updated!) };
  });

  // POST /v1/inbox/:id/suggest-reply — AI-generated reply suggestion
  fastify.post('/:id/suggest-reply', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const dealer_id = (request.user as { dealer_id: string | null }).dealer_id as string;
    const { id } = request.params as { id: string };
    const message = await prisma.inboxMessage.findFirst({ where: { id, dealer_id } });
    if (!message) return reply.code(404).send({ error: 'Not found' });

    // Return cached suggestion if already generated
    if (message.ai_suggested_reply) {
      return { suggestedReply: message.ai_suggested_reply };
    }

    // TODO: call OpenAI to generate reply based on message context
    const suggestedReply = `Thank you for your message! We appreciate your interest. Please contact us at your earliest convenience and we'll be happy to assist you.`;
    await prisma.inboxMessage.update({ where: { id }, data: { ai_suggested_reply: suggestedReply } });
    return { suggestedReply };
  });

  // POST /v1/inbox/webhook/meta — receive Meta webhook events
  fastify.post('/webhook/meta', async (request, reply) => {
    fastify.log.info('Received Meta webhook event');
    // TODO: parse and store incoming comments/DMs as InboxMessage records
    return reply.code(200).send('EVENT_RECEIVED');
  });

  // GET /v1/inbox/webhook/meta — Meta webhook verification challenge
  fastify.get('/webhook/meta', async (request, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = request.query as Record<string, string>;
    const VERIFY_TOKEN = process.env['META_WEBHOOK_VERIFY_TOKEN'] ?? 'cardeko_webhook_secret';
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return reply.code(200).send(challenge);
    }
    return reply.code(403).send({ error: 'Forbidden' });
  });
}
