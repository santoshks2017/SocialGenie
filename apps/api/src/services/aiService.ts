import OpenAI from 'openai';

export interface CreativeInput {
  car: string;
  offer: string;
  festival: string;
  city: string;
}

export interface CreativeOutput {
  caption: string;
  headline: string;
  cta: string;
}

let client: OpenAI | null = null;
function getGroqClient(): OpenAI {
  if (!client) {
    const apiKey = process.env['GROQ_API_KEY'];
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');
    client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return client;
}

export async function generateCreativeContent(input: CreativeInput): Promise<CreativeOutput> {
  const groq = getGroqClient();
  const GROQ_MODEL = process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile';

  const systemPrompt = `You are an Indian auto dealer marketing expert. 
You write short, catchy, and realistic marketing copy in Hinglish (a mix of Hindi and English) that drives sales.`;

  const userMessage = `Generate a creative marketing post for an auto dealership.
Car: ${input.car}
Offer: ${input.offer}
Festival/Occasion: ${input.festival}
City: ${input.city}

Return ONLY a JSON object with the following fields:
- "headline": Short, punchy title (max 5-7 words).
- "caption": A catchy 2-3 sentence description in Hinglish.
- "cta": Call to action (e.g. Call us, Visit showroom).

Keep it realistic, persuasive, and strictly JSON format.`;

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  const parsed = JSON.parse(content) as Record<string, unknown>;
  return {
    headline: String(parsed['headline'] || ''),
    caption: String(parsed['caption'] || ''),
    cta: String(parsed['cta'] || ''),
  };
}
