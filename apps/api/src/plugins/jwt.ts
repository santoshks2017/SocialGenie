import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';
import type { JwtUser } from '../lib/permissions.js';
import { resolvePermissions, ROLES } from '../lib/permissions.js';

export type { JwtUser };

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Dev autologin is only active when BOTH conditions hold:
//   1. NODE_ENV is explicitly NOT "production"
//   2. ALLOW_DEV_AUTOLOGIN=true is set
// This means a staging/preview env that forgets NODE_ENV defaults to requiring a real token.
const DEV_AUTOLOGIN =
  process.env['NODE_ENV'] !== 'production' &&
  process.env['ALLOW_DEV_AUTOLOGIN'] === 'true';

export async function registerJwt(fastify: FastifyInstance) {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET env var is required');

  await fastify.register(fjwt, {
    secret,
    sign: { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' },
  });

  // Startup log so the mode is always visible in deployment logs
  if (DEV_AUTOLOGIN) {
    fastify.log.warn(
      '[AUTH] ⚠️  DEV AUTOLOGIN ENABLED — all unauthenticated requests are granted admin access. ' +
      'Set NODE_ENV=production or remove ALLOW_DEV_AUTOLOGIN=true to disable.',
    );
  } else {
    fastify.log.info(`[AUTH] JWT authentication active (NODE_ENV=${process.env['NODE_ENV'] ?? 'unset'})`);
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    // Dev autologin: auto-create or find first admin DealerUser (local dev only)
    if (DEV_AUTOLOGIN && !request.headers.authorization) {
      const { prisma } = await import('../db/prisma.js');

      // Ensure a dealer org exists
      let dealer = await prisma.dealer.findFirst();
      if (!dealer) {
        dealer = await prisma.dealer.create({ data: { name: 'Local Dev Dealer', city: 'Mumbai', phone: '9876543210' } });
      }

      // Ensure a dev DealerUser exists for this dealer
      let devUser = await prisma.dealerUser.findFirst({ where: { dealer_id: dealer.id } });
      if (!devUser) {
        devUser = await prisma.dealerUser.create({
          data: { phone: '9876543210', name: 'Dev Admin', role: ROLES.ADMIN, dealer_id: dealer.id, is_active: true },
        });
      }

      const permissions = resolvePermissions(devUser.role, devUser.permissions as Record<string, boolean> | null);
      request.user = { dealer_user_id: devUser.id, dealer_id: dealer.id, role: devUser.role as JwtUser['role'], phone: devUser.phone, permissions };
      return;
    }

    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }
  });
}
