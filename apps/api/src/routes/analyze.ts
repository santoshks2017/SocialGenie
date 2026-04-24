import type { FastifyInstance } from 'fastify';
import { extractPatterns } from '@cardeko/pattern-engine';
import { prisma } from '../db/prisma.js';

interface AnalyzeRequestBody {
  data?: {
    images?: string[];
    text?: string;
  };
}

export default async function analyzeRoutes(fastify: FastifyInstance) {
  // POST /v1/analyze
  fastify.post('/analyze', async (request, reply) => {
    const body = request.body as AnalyzeRequestBody | undefined;

    if (!body || !body.data) {
      return reply.code(400).send({ error: 'Missing "data" field in request body' });
    }

    const { images, text } = body.data;

    if (!Array.isArray(images) || typeof text !== 'string') {
      return reply.code(400).send({ 
        error: 'Invalid "data" format. Expected { images: string[], text: string }' 
      });
    }

    try {
      const result = extractPatterns({ images, text });
      
      const savedRecord = await prisma.dealerStyle.create({
        data: {
          dealerId: 'test-dealer',
          festivals: result.detectedFestivals,
          imageCount: result.imageCount,
          hasPhone: result.hasPhone,
        }
      });

      return { success: true, patterns: result, savedRecord };
    } catch (err) {
      fastify.log.error(`Pattern analysis failed: ${String(err)}`);
      return reply.code(500).send({ error: 'Failed to analyze patterns' });
    }
  });
}
