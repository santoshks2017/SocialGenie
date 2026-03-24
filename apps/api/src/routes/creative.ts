import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';
import { generateCaptions } from '../services/openai.js';



// Simple in-memory cache: key → {result, expires}
const captionCache = new Map<string, { result: unknown; expires: number }>();

export default async function creativeRoutes(fastify: FastifyInstance) {
  // POST /v1/creatives/generate
  fastify.post('/generate', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const dealer_id = request.user.dealer_id;
    const { prompt, platforms } = request.body as {
      prompt: string;
      platforms?: string[];
    };

    if (!prompt?.trim()) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'prompt is required' } });
    }

    // Load dealer context
    const dealer = await prisma.dealer.findUnique({ where: { id: dealer_id } });
    if (!dealer) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Dealer not found' } });

    const dealerContext = {
      name: dealer.name,
      city: dealer.city,
      brands: (dealer.brands as string[] | null) ?? [],
      phone: dealer.contact_phone ?? dealer.phone,
      whatsapp: dealer.whatsapp_number ?? dealer.phone,
      language_preferences: dealer.language_preferences,
    };

    // Try to match vehicle from prompt against inventory
    let inventoryContext: Parameters<typeof generateCaptions>[2] | undefined;
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
    if (vehicleMatch) {
      inventoryContext = {
        make: vehicleMatch.make,
        model: vehicleMatch.model,
        ...(vehicleMatch.variant ? { variant: vehicleMatch.variant } : {}),
        price: vehicleMatch.price,
        features: [],
        stock_count: vehicleMatch.stock_count,
      };
    }

    // Cache key based on prompt + dealer city + vehicle
    const cacheKey = `${dealer_id}:${prompt}:${vehicleMatch?.id ?? 'none'}`;
    const cached = captionCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { success: true, ...(cached.result as object), cached: true };
    }

    // Generate captions — fall back to mock if API key not set
    let captions: Awaited<ReturnType<typeof generateCaptions>>;
    if (process.env['OPENAI_API_KEY']) {
      try {
        captions = await generateCaptions(prompt, dealerContext, inventoryContext);
      } catch (err) {
        fastify.log.error(err, 'OpenAI caption generation failed');
        return reply.code(500).send({ error: { code: 'AI_ERROR', message: 'Caption generation failed. Please try again.' } });
      }
    } else {
      // Dev fallback when no API key
      captions = {
        variants: [
          {
            caption_text: `${prompt} — Visit ${dealer.name} in ${dealer.city} today! Limited time offer. Call: ${dealer.contact_phone ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#CarDeals', '#AutoOffer'],
            suggested_emoji: ['🚗', '✨'],
            platform_notes: 'Works for all platforms',
            style: 'punchy',
          },
          {
            caption_text: `Looking for the best deal? ${prompt}. At ${dealer.name}, ${dealer.city}, we make car ownership easy. Zero down payment options available. Book your test drive today! Call us: ${dealer.contact_phone ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#CarDeals', '#TestDrive', '#AutoFinance'],
            suggested_emoji: ['🚗', '💰', '📞'],
            platform_notes: 'Ideal for Facebook long-form',
            style: 'detailed',
          },
          {
            caption_text: `Every journey begins with a dream. ${prompt}. Let ${dealer.name} make your dream a reality. Come visit us in ${dealer.city} — your perfect car is waiting. WhatsApp us: ${dealer.whatsapp_number ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#DreamCar', '#NewBeginnings'],
            suggested_emoji: ['❤️', '🌟'],
            platform_notes: 'Best for Instagram stories',
            style: 'emotional',
          },
        ],
      };
    }

    // Mock creative image URLs (real impl would use Sharp/Puppeteer + S3)
    const creatives = [
      { id: 'tpl_bold_banner', template_name: 'Bold Banner', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
      { id: 'tpl_minimal', template_name: 'Minimal Showcase', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
      { id: 'tpl_offer_card', template_name: 'Offer Card', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
    ];

    const result = {
      captions: captions.variants,
      hindi_captions: captions.hindi_variants ?? null,
      creatives,
      inventory_matched: vehicleMatch
        ? { id: vehicleMatch.id, make: vehicleMatch.make, model: vehicleMatch.model, price: vehicleMatch.price }
        : null,
      platforms_requested: platforms ?? ['facebook', 'instagram', 'gmb'],
    };

    // Cache for 24 hours
    captionCache.set(cacheKey, { result, expires: Date.now() + 24 * 60 * 60 * 1000 });

    return { success: true, ...result, cached: false };
  });

  // GET /v1/creatives/prompts — list suggested prompts
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
