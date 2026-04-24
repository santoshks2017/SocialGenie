import type { FastifyInstance } from 'fastify';
import { generateCreativeContent } from '../services/aiService.js';
import { recommendTemplate } from '@cardeko/template-engine';
import { renderCreative } from '@cardeko/render-engine';

interface GeneratePostRequest {
  car?: string;
  offer?: string;
  festival?: string;
  city?: string;
  imageUrl?: string;
}

export default async function generatePostRoutes(fastify: FastifyInstance) {
  // POST /v1/generate-post
  fastify.post('/generate-post', async (request, reply) => {
    const body = request.body as GeneratePostRequest | undefined;

    if (!body || !body.car || !body.offer || !body.festival || !body.city || !body.imageUrl) {
      return reply.code(400).send({ 
        error: 'Invalid request body. Expected { car, offer, festival, city, imageUrl }' 
      });
    }

    try {
      // 1. Call AI LLM API -> get content
      const content = await generateCreativeContent({
        car: body.car,
        offer: body.offer,
        festival: body.festival,
        city: body.city
      });

      // 2. Call template engine -> select template
      const template = recommendTemplate({ festival: body.festival });

      // 3. Call render engine -> generate image
      // Passing the AI generated headline as title, and original offer text
      const imageBuffer = await renderCreative({
        title: content.headline,
        offer: body.offer,
        imageUrl: body.imageUrl
      });

      // Convert buffer to base64
      const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      // Return combined result
      return {
        success: true,
        content,
        template,
        image: imageBase64
      };
    } catch (err) {
      fastify.log.error(`Generate post failed: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to generate post' });
    }
  });
}
