import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';

export interface JwtPayload {
  dealer_id: string;
  phone: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerJwt(fastify: FastifyInstance) {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET env var is required');

  await fastify.register(fjwt, {
    secret,
    sign: { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    // Development bypass
    if (process.env['NODE_ENV'] !== 'production' && !request.headers.authorization) {
      const { prisma } = await import('../db/prisma.js');
      let dealer = await prisma.dealer.findFirst();
      if (!dealer) {
        dealer = await prisma.dealer.create({
          data: {
            name: 'Local Dev Dealer',
            city: 'Mumbai',
            phone: '9876543210',
          }
        });
      }
      request.user = { dealer_id: dealer.id, phone: dealer.phone };
      return;
    }

    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }
  });
}
