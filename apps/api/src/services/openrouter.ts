import OpenAI from 'openai';
import type { DealerContext, InventoryContext, GeneratedCaptions, CaptionVariant } from './openai.js';

export type { DealerContext, InventoryContext, GeneratedCaptions, CaptionVariant };

// OpenRouter is OpenAI-compatible — same SDK, different base URL
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env['OPENROUTER_API_KEY'];
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
    client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
        'X-Title': 'SocialGenie',
      },
    });
  }
  return client;
}

const OPENROUTER_MODEL = process.env['OPENROUTER_MODEL'] ?? 'meta-llama/llama-3.3-70b-instruct';

const SYSTEM_PROMPT = `You are a social media marketing expert for Indian automobile dealerships.
You write captions that drive footfall, enquiries, and leads.

RULES:
1. Never invent or approximate prices. If no price provided, omit pricing entirely.
2. Never invent vehicle specifications. Only use provided data.
3. Include a clear call-to-action: visit showroom, call now, WhatsApp us.
4. Use the dealer's city name for local relevance.
5. Keep tone professional but warm — trusted local business, not a meme page.
6. Generate exactly 3 variants using DIFFERENT angles and opening lines:
   - "punchy": Under 60 words, urgency/scarcity hook. Best for Instagram.
   - "detailed": 100-150 words, lists 2-3 benefits + EMI/price if available. Best for Facebook.
   - "emotional": 70-100 words, aspirational — connects car to family/lifestyle/dreams. Best for Instagram Feed.

OUTPUT FORMAT (valid JSON only, no markdown fences):
{
  "variants": [
    { "caption_text": "...", "hashtags": ["#tag1","#tag2"], "suggested_emoji": ["🚗"], "platform_notes": "Best for Instagram Stories", "style": "punchy" },
    { "caption_text": "...", "hashtags": ["#tag1","#tag2"], "suggested_emoji": ["✨"], "platform_notes": "Best for Facebook", "style": "detailed" },
    { "caption_text": "...", "hashtags": ["#tag1","#tag2"], "suggested_emoji": ["❤️"], "platform_notes": "Best for Instagram Feed", "style": "emotional" }
  ]
}`;

export async function generateCaptions(
  prompt: string,
  dealer: DealerContext,
  inventory?: InventoryContext,
): Promise<GeneratedCaptions> {
  const or = getClient();

  const vehicleBlock = inventory
    ? `VEHICLE: ${inventory.make ?? ''} ${inventory.model ?? ''} ${inventory.variant ?? ''} | Price: ${inventory.price ? `₹${(inventory.price / 100000).toFixed(2)} Lakhs` : 'not provided — omit pricing'} | Stock: ${inventory.stock_count ?? 'available'}`
    : 'VEHICLE: Use prompt details only.';

  const userMessage = `DEALER: ${dealer.name}, ${dealer.city} | Phone: ${dealer.phone} | WhatsApp: ${dealer.whatsapp}
${vehicleBlock}
PROMPT: "${prompt}"

Generate 3 caption variants as JSON.`;

  const response = await or.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.85,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  const parsed = JSON.parse(content) as { variants?: unknown[] };
  if (!Array.isArray(parsed.variants) || parsed.variants.length < 1) {
    throw new Error('Invalid caption structure from OpenRouter');
  }

  const styles: Array<'punchy' | 'detailed' | 'emotional'> = ['punchy', 'detailed', 'emotional'];
  const variants = parsed.variants.slice(0, 3).map((v: unknown, i: number) => {
    const obj = v as Record<string, unknown>;
    return {
      caption_text: String(obj['caption_text'] ?? ''),
      hashtags: Array.isArray(obj['hashtags']) ? (obj['hashtags'] as string[]) : [],
      suggested_emoji: Array.isArray(obj['suggested_emoji']) ? (obj['suggested_emoji'] as string[]) : [],
      platform_notes: String(obj['platform_notes'] ?? ''),
      style: styles[i] ?? 'punchy',
    } satisfies CaptionVariant;
  });

  while (variants.length < 3) variants.push({ ...variants[0]!, style: styles[variants.length] ?? 'punchy' });

  return { variants: variants as [CaptionVariant, CaptionVariant, CaptionVariant] };
}

export async function generateInboxReply(
  messageText: string,
  sentiment: string,
  dealer: DealerContext,
  messageType: 'comment' | 'dm' | 'review',
): Promise<string> {
  const or = getClient();
  const maxWords = messageType === 'comment' ? 80 : 180;

  const response = await or.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a customer service assistant for ${dealer.name} in ${dealer.city}. Be polite and professional. Always include CTA: call ${dealer.phone} or WhatsApp ${dealer.whatsapp}. Under ${maxWords} words. SENTIMENT: ${sentiment}. Return JSON: {"reply":"..."}`,
      },
      { role: 'user', content: `Customer ${messageType}: "${messageText}"` },
    ],
    temperature: 0.6,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '';
  try {
    const parsed = JSON.parse(content) as { reply?: string };
    return parsed.reply?.trim() ?? content.trim();
  } catch {
    return content.trim();
  }
}

export function isOpenRouterAvailable(): boolean {
  return !!(process.env['OPENROUTER_API_KEY']);
}
