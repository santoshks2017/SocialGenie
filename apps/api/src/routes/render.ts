import type { FastifyInstance } from 'fastify';
import { renderCreative } from '@cardeko/render-engine';

interface RenderRequestBody {
  title?: string;
  offer?: string;
  imageUrl?: string;
}

export default async function renderRoutes(fastify: FastifyInstance) {
  // POST /v1/render
  fastify.post('/render', async (request, reply) => {
    const body = request.body as RenderRequestBody | undefined;

    if (!body || typeof body.title !== 'string' || typeof body.offer !== 'string' || typeof body.imageUrl !== 'string') {
      return reply.code(400).send({ 
        error: 'Invalid request body. Expected { title: string, offer: string, imageUrl: string }' 
      });
    }

    try {
      const buffer = await renderCreative({
        title: body.title,
        offer: body.offer,
        imageUrl: body.imageUrl
      });

      // Return the image as image/png
      return reply
        .code(200)
        .header('Content-Type', 'image/png')
        .send(buffer);
    } catch (err) {
      fastify.log.error(`Creative render failed: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to render creative' });
    }
  });
}
