import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '../db/prisma.js';
import { generateCaptions as openaiGenerateCaptions } from '../services/openai.js';
import {
  generateCaptions as ollamaGenerateCaptions,
  isOllamaAvailable,
} from '../services/ollama.js';
import { renderCreatives, extractHeadline } from '../services/templateRenderer.js';
import { ORIGINALS_DIR, CREATIVES_DIR } from './upload.js';
import type { GeneratedCaptions } from '../services/openai.js';

// Simple in-memory cache: key → {result, expires}
const captionCache = new Map<string, { result: unknown; expires: number }>();

const BASE_URL = process.env['API_BASE_URL'] ?? 'http://localhost:3001';

// Try Ollama → OpenAI → mock
async function generateCaptionsAI(
  prompt: string,
  dealerContext: Parameters<typeof openaiGenerateCaptions>[1],
  inventoryContext?: Parameters<typeof openaiGenerateCaptions>[2],
): Promise<GeneratedCaptions> {
  // 1. Try Ollama
  if (await isOllamaAvailable()) {
    try {
      return await ollamaGenerateCaptions(prompt, dealerContext, inventoryContext);
    } catch (err) {
      console.error('Ollama generation failed, falling back:', err);
    }
  }

  // 2. Try OpenAI
  if (process.env['OPENAI_API_KEY']) {
    return await openaiGenerateCaptions(prompt, dealerContext, inventoryContext);
  }

  // 3. Mock fallback
  return {
    variants: [
      {
        caption_text: `${prompt} — Visit ${dealerContext.name} in ${dealerContext.city}! Limited time offer. Call: ${dealerContext.phone}`,
        hashtags: [`#${dealerContext.city.replace(/\s/g, '')}`, '#CarDeals', '#AutoOffer'],
        suggested_emoji: ['🚗', '✨'],
        platform_notes: 'Works for all platforms',
        style: 'punchy',
      },
      {
        caption_text: `Looking for the best deal? ${prompt}. At ${dealerContext.name}, ${dealerContext.city}, we make car ownership easy. Zero down payment options available. Book your test drive today! Call us: ${dealerContext.phone}`,
        hashtags: [`#${dealerContext.city.replace(/\s/g, '')}`, '#CarDeals', '#TestDrive', '#AutoFinance'],
        suggested_emoji: ['🚗', '💰', '📞'],
        platform_notes: 'Ideal for Facebook long-form',
        style: 'detailed',
      },
      {
        caption_text: `Every journey begins with a dream. ${prompt}. Let ${dealerContext.name} make your dream a reality. Visit us in ${dealerContext.city}. WhatsApp: ${dealerContext.whatsapp}`,
        hashtags: [`#${dealerContext.city.replace(/\s/g, '')}`, '#DreamCar', '#NewBeginnings'],
        suggested_emoji: ['❤️', '🌟'],
        platform_notes: 'Best for Instagram stories',
        style: 'emotional',
      },
    ],
  };
}

export default async function creativeRoutes(fastify: FastifyInstance) {
  // POST /v1/creatives/generate
  fastify.post('/generate', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const dealer_id = request.user.dealer_id as string;
    const { prompt, platforms, image_id } = request.body as {
      prompt: string;
      platforms?: string[];
      image_id?: string;  // filename from POST /v1/upload/image
    };

    if (!prompt?.trim()) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'prompt is required' } });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: dealer_id } });
    if (!dealer) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Dealer not found' } });

    const dealerContext = {
      name: dealer.name,
      city: dealer.city,
      brands: (dealer.brands as string[] | null) ?? [],
      phone: dealer.contact_phone ?? dealer.phone,
      whatsapp: dealer.whatsapp_number ?? dealer.phone,
      language_preferences: (dealer.language_preferences as string[] | null) ?? [],
    };

    // Match inventory from prompt keywords
    const words = prompt.toLowerCase().split(/\s+/);
    const vehicleMatch = await prisma.inventoryItem.findFirst({
      where: {
        dealer_id,
        status: 'in_stock',
        OR: words.map((w) => ({
          OR: [
            { make: { contains: w, mode: 'insensitive' } },
            { model: { contains: w, mode: 'insensitive' } },
          ],
        })),
      },
    });

    const inventoryContext = vehicleMatch
      ? {
          make: vehicleMatch.make,
          model: vehicleMatch.model,
          ...(vehicleMatch.variant ? { variant: vehicleMatch.variant } : {}),
          price: vehicleMatch.price,
          features: [] as string[],
          stock_count: vehicleMatch.stock_count,
        }
      : undefined;

    // Cache captions (not images)
    const cacheKey = `${dealer_id}:${prompt}:${vehicleMatch?.id ?? 'none'}`;
    const cached = captionCache.get(cacheKey);
    const cachedCaptions = cached && cached.expires > Date.now()
      ? (cached.result as GeneratedCaptions)
      : null;

    let captions: GeneratedCaptions;
    if (cachedCaptions) {
      captions = cachedCaptions;
    } else {
      try {
        captions = await generateCaptionsAI(prompt, dealerContext, inventoryContext);
        captionCache.set(cacheKey, { result: captions, expires: Date.now() + 24 * 60 * 60 * 1000 });
      } catch (err) {
        fastify.log.error(err, 'Caption generation failed');
        return reply.code(500).send({ error: { code: 'AI_ERROR', message: 'Caption generation failed. Please try again.' } });
      }
    }

    // Render templates if an image was uploaded
    let creatives: Array<{
      id: string;
      template_name: string;
      thumbnail_url: string | null;
      platform_urls: Record<string, string | null>;
    }>;

    if (image_id) {
      try {
        const imageBuffer = await readFile(path.join(ORIGINALS_DIR, image_id));
        const headline = extractHeadline(captions.variants[0]?.caption_text ?? prompt);
        const filePrefix = randomUUID();

        const rendered = await renderCreatives({
          imageBuffer,
          headline,
          dealerName: dealer.name,
          city: dealer.city,
          phone: dealer.contact_phone ?? dealer.phone,
          primaryColor: dealer.primary_color ?? '#1877F2',
          price: inventoryContext?.price,
          outputDir: CREATIVES_DIR,
          filePrefix,
        });

        const url = (f: string) => `${BASE_URL}/uploads/creatives/${f}`;

        creatives = [
          {
            id: 'tpl_bold_banner',
            template_name: 'Bold Banner',
            thumbnail_url: url(rendered.boldBanner),
            platform_urls: { facebook: url(rendered.boldBanner), instagram: url(rendered.boldBanner), instagram_story: null, gmb: url(rendered.boldBanner) },
          },
          {
            id: 'tpl_minimal',
            template_name: 'Minimal Showcase',
            thumbnail_url: url(rendered.minimalShowcase),
            platform_urls: { facebook: url(rendered.minimalShowcase), instagram: url(rendered.minimalShowcase), instagram_story: null, gmb: url(rendered.minimalShowcase) },
          },
          {
            id: 'tpl_offer_card',
            template_name: 'Offer Card',
            thumbnail_url: url(rendered.offerCard),
            platform_urls: { facebook: url(rendered.offerCard), instagram: url(rendered.offerCard), instagram_story: null, gmb: url(rendered.offerCard) },
          },
        ];
      } catch (err) {
        fastify.log.error(err, 'Template rendering failed, using placeholders');
        creatives = mockCreatives();
      }
    } else {
      creatives = mockCreatives();
    }

    return {
      success: true,
      captions: captions.variants,
      hindi_captions: null,
      creatives,
      inventory_matched: vehicleMatch
        ? { id: vehicleMatch.id, make: vehicleMatch.make, model: vehicleMatch.model, price: vehicleMatch.price }
        : null,
      platforms_requested: platforms ?? ['facebook', 'instagram', 'gmb'],
      cached: !!cachedCaptions,
    };
  });

  // GET /v1/creatives/prompts
  fastify.get('/prompts', async (request, _reply) => {
    const { category, limit = '10' } = request.query as { category?: string; limit?: string };
    const where = category ? { category, is_active: true } : { is_active: true };
    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: [{ usage_count: 'desc' }, { sort_order: 'asc' }],
      take: parseInt(limit),
    });
    return { success: true, data: prompts };
  });
}

function mockCreatives() {
  return [
    { id: 'tpl_bold_banner', template_name: 'Bold Banner', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
    { id: 'tpl_minimal', template_name: 'Minimal Showcase', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
    { id: 'tpl_offer_card', template_name: 'Offer Card', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
  ];
}
