import type {
  DealerContext,
  InventoryContext,
  GeneratedCaptions,
  CaptionVariant,
} from './openai.js';

export type { DealerContext, InventoryContext, GeneratedCaptions, CaptionVariant };

const OLLAMA_BASE = process.env['OLLAMA_HOST'] ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env['OLLAMA_MODEL'] ?? 'llama3.2';

const SYSTEM_PROMPT = `You are a social media marketing expert for Indian automobile dealerships. Write captions that drive footfall, enquiries, and leads.

STRICT RULES:
- Never invent prices or specs. Use only what is provided.
- Each of the 3 variants MUST use a completely different angle, opening line, and tone.
- Never start two variants with the same word or phrase.
- Include dealer city name and a clear call-to-action (call/WhatsApp/visit) in each variant.

VARIANT ANGLES (use exactly these three, in this order):
1. "punchy" — Urgency + scarcity angle. Under 60 words. Hook word first. Best for Instagram Reels/Stories.
   Example opening style: "LIMITED STOCK ALERT!" or "Only X units left!"
2. "detailed" — Feature + value angle. 100-150 words. List 2-3 concrete benefits, mention EMI/finance if relevant. Best for Facebook.
   Example opening style: "Here's everything you need to know about..." or "Why [City] families love..."
3. "emotional" — Aspiration + life moment angle. 70-100 words. Connect the car to a feeling, milestone, or dream. Best for Instagram Feed.
   Example opening style: "Some journeys change everything." or "Your family deserves the best."

OUTPUT: valid JSON only, no markdown, no extra text outside the JSON:
{"variants":[{"caption_text":"...","hashtags":["#tag1","#tag2"],"suggested_emoji":["🚗"],"platform_notes":"Best for Instagram Stories","style":"punchy"},{"caption_text":"...","hashtags":["#tag1","#tag2"],"suggested_emoji":["✨"],"platform_notes":"Best for Facebook","style":"detailed"},{"caption_text":"...","hashtags":["#tag1","#tag2"],"suggested_emoji":["❤️"],"platform_notes":"Best for Instagram Feed","style":"emotional"}]}`;

async function chat(systemPrompt: string, userMessage: string, temperature = 0.8): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      format: 'json',
      options: { temperature },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  const data = await res.json() as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content) throw new Error('Empty response from Ollama');
  return content;
}

function parseCaptions(content: string): GeneratedCaptions {
  const parsed = JSON.parse(content) as { variants?: unknown[] };
  if (!Array.isArray(parsed.variants) || parsed.variants.length < 1) {
    throw new Error('Invalid caption structure');
  }

  const styles: Array<'punchy' | 'detailed' | 'emotional'> = ['punchy', 'detailed', 'emotional'];
  const variants = parsed.variants.slice(0, 3).map((v: unknown, i: number) => {
    const obj = v as Record<string, unknown>;
    return {
      caption_text: String(obj['caption_text'] ?? obj['caption'] ?? ''),
      hashtags: Array.isArray(obj['hashtags']) ? (obj['hashtags'] as string[]) : [],
      suggested_emoji: Array.isArray(obj['suggested_emoji']) ? (obj['suggested_emoji'] as string[]) : [],
      platform_notes: String(obj['platform_notes'] ?? ''),
      style: styles[i] ?? 'punchy',
    } satisfies CaptionVariant;
  });

  // Pad to 3 if model returned fewer
  while (variants.length < 3) variants.push({ ...variants[0]!, style: styles[variants.length] ?? 'punchy' });

  return { variants: variants as [CaptionVariant, CaptionVariant, CaptionVariant] };
}

export async function generateCaptions(
  prompt: string,
  dealer: DealerContext,
  inventory?: InventoryContext,
): Promise<GeneratedCaptions> {
  const vehicleBlock = inventory
    ? `VEHICLE: ${inventory.make ?? ''} ${inventory.model ?? ''} ${inventory.variant ?? ''} | Price: ${inventory.price ? `₹${(inventory.price / 100000).toFixed(2)} Lakhs (exact)` : 'not provided'} | Stock: ${inventory.stock_count ?? 'available'}`
    : 'VEHICLE: Use prompt details only.';

  const userMessage = `DEALER: ${dealer.name}, ${dealer.city} | Brands: ${dealer.brands.join(', ')} | Phone: ${dealer.phone} | WhatsApp: ${dealer.whatsapp}
${vehicleBlock}
PROMPT: "${prompt}"

Generate 3 caption variants as JSON.`;

  const content = await chat(SYSTEM_PROMPT, userMessage);
  return parseCaptions(content);
}

export async function generateInboxReply(
  messageText: string,
  sentiment: string,
  dealer: DealerContext,
  messageType: 'comment' | 'dm' | 'review',
): Promise<string> {
  const maxWords = messageType === 'comment' ? 80 : 180;

  const systemPrompt = `You are a helpful customer service assistant for ${dealer.name}, an automobile dealership in ${dealer.city}.
Be polite, professional, and helpful. Never promise pricing or discounts unless provided.
Always include a CTA: visit showroom, call ${dealer.phone}, or WhatsApp ${dealer.whatsapp}.
Keep under ${maxWords} words. Match the customer's language.
SENTIMENT: ${sentiment}. For negative sentiment, lead with a sincere apology.
Return ONLY the reply text — no JSON, no labels.
Output JSON: { "reply": "..." }`;

  const userMessage = `Customer ${messageType}: "${messageText}"`;
  const content = await chat(systemPrompt, userMessage, 0.6);

  try {
    const parsed = JSON.parse(content) as { reply?: string };
    return parsed.reply?.trim() ?? content.trim();
  } catch {
    return content.trim();
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}
