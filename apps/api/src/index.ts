import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';

import { registerJwt } from './plugins/jwt.js';
import { registerActivityLog } from './plugins/activityLog.js';
import { startPublishWorker } from './workers/publishWorker.js';
import { startMetricsWorker } from './workers/metricsWorker.js';

import authRoutes from './routes/auth.js';
import dealerRoutes from './routes/dealer.js';
import platformRoutes from './routes/platform.js';
import creativeRoutes from './routes/creative.js';
import publisherRoutes from './routes/publisher.js';
import inventoryRoutes from './routes/inventory.js';
import inboxRoutes from './routes/inbox.js';
import boostRoutes from './routes/boost.js';
import leadsRoutes from './routes/leads.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  credentials: true,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.ip,
});

await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

await registerJwt(fastify);
await registerActivityLog(fastify);

// Routes
fastify.register(authRoutes,      { prefix: '/v1/auth' });
fastify.register(dealerRoutes,    { prefix: '/v1/dealer' });
fastify.register(platformRoutes,  { prefix: '/v1/platforms' });
fastify.register(creativeRoutes,  { prefix: '/v1/creatives' });
fastify.register(publisherRoutes, { prefix: '/v1/publisher' });
fastify.register(inventoryRoutes, { prefix: '/v1/inventory' });
fastify.register(inboxRoutes,     { prefix: '/v1/inbox' });
fastify.register(boostRoutes,     { prefix: '/v1/boost' });
fastify.register(leadsRoutes,     { prefix: '/v1/leads' });

fastify.get('/v1/health', async () => ({
  status: 'ok',
  service: 'Cardeko Social AI - API',
  env: process.env['NODE_ENV'] ?? 'development',
}));

const start = async () => {
  try {
    const port = parseInt(process.env['PORT'] ?? '3001');
    await fastify.listen({ port, host: '0.0.0.0' });

    // Start background workers (only if Redis is reachable)
    if (process.env['NODE_ENV'] !== 'test') {
      startPublishWorker();
      startMetricsWorker();
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
