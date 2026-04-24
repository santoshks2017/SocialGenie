/**
 * Indian Auto Dealer Social Scraper
 *
 * Fetches public social media pages and extracts post content.
 * Supports direct URL scraping + Meta Graph API (when token provided).
 *
 * Scraped content is:
 *   1. Stored in InspirationHandle.posts_cache (per-dealer context)
 *   2. Analysed by the AI prompt builder to detect regional/brand patterns
 *
 * Seeding flow:
 *   POST /v1/admin/scraper/seed  →  scrapes the curated list below
 *   POST /v1/dealer/inspiration-handles  →  dealer adds their own reference pages
 */

// ─── Curated list of top Indian auto dealer pages ────────────────────────────
// These are well-performing public pages that serve as pattern references.
// Add Meta Graph API page IDs when a token is available.
export const SEED_PAGES: Array<{
  name: string;
  brand: string;
  region: string;
  state: string;
  platform: 'facebook' | 'instagram';
  url: string;
  fb_page_id?: string; // for Graph API
}> = [
  // ── North India ───────────────────────────────────────────────────────────
  { name: 'Maruti Arena Delhi North', brand: 'Maruti Suzuki', region: 'north_india', state: 'Delhi', platform: 'facebook', url: 'https://www.facebook.com/MarutiSuzukiArena' },
  { name: 'Hyundai Gurgaon', brand: 'Hyundai', region: 'north_india', state: 'Haryana', platform: 'facebook', url: 'https://www.facebook.com/HyundaiIndia' },
  { name: 'Tata Motors Noida', brand: 'Tata', region: 'north_india', state: 'Uttar Pradesh', platform: 'facebook', url: 'https://www.facebook.com/TataMotorsIndia' },
  { name: 'Mahindra Jaipur', brand: 'Mahindra', region: 'north_india', state: 'Rajasthan', platform: 'facebook', url: 'https://www.facebook.com/MahindraRise' },
  { name: 'Kia India', brand: 'Kia', region: 'north_india', state: 'Delhi', platform: 'instagram', url: 'https://www.instagram.com/kiaindia/' },

  // ── West India ────────────────────────────────────────────────────────────
  { name: 'Maruti Nexa Mumbai', brand: 'Maruti Suzuki', region: 'west_india', state: 'Maharashtra', platform: 'facebook', url: 'https://www.facebook.com/MarutiSuzukiNEXA' },
  { name: 'Tata Motors Pune', brand: 'Tata', region: 'west_india', state: 'Maharashtra', platform: 'instagram', url: 'https://www.instagram.com/tatamotors/' },
  { name: 'MG Motor India', brand: 'MG', region: 'west_india', state: 'Gujarat', platform: 'instagram', url: 'https://www.instagram.com/mgmotorindia/' },
  { name: 'Mahindra Ahmedabad', brand: 'Mahindra', region: 'west_india', state: 'Gujarat', platform: 'facebook', url: 'https://www.facebook.com/MahindraRise' },

  // ── South India ───────────────────────────────────────────────────────────
  { name: 'Hyundai Bangalore', brand: 'Hyundai', region: 'south_india', state: 'Karnataka', platform: 'instagram', url: 'https://www.instagram.com/hyundaiindia/' },
  { name: 'Toyota Chennai', brand: 'Toyota', region: 'south_india', state: 'Tamil Nadu', platform: 'facebook', url: 'https://www.facebook.com/ToyotaIndia' },
  { name: 'Honda Cars India', brand: 'Honda', region: 'south_india', state: 'Karnataka', platform: 'instagram', url: 'https://www.instagram.com/hondacarsindia/' },
  { name: 'Skoda India', brand: 'Skoda', region: 'south_india', state: 'Telangana', platform: 'instagram', url: 'https://www.instagram.com/skodaindia/' },

  // ── East India ────────────────────────────────────────────────────────────
  { name: 'Maruti Kolkata', brand: 'Maruti Suzuki', region: 'east_india', state: 'West Bengal', platform: 'facebook', url: 'https://www.facebook.com/MarutiSuzukiArena' },
  { name: 'Tata Motors Kolkata', brand: 'Tata', region: 'east_india', state: 'West Bengal', platform: 'facebook', url: 'https://www.facebook.com/TataMotorsIndia' },
];

// ─── HTML scraper (public pages, no API needed) ───────────────────────────────
export async function scrapePublicPage(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const stripped = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ');

    // Extract text segments that look like social media captions
    const candidates = stripped
      .split(/[\n.!?]+/)
      .map((s) => s.trim())
      .filter((s) => {
        if (s.length < 30 || s.length > 500) return false;
        // Filter out navigation, meta text, script fragments
        const lower = s.toLowerCase();
        if (lower.includes('cookie') || lower.includes('privacy policy') || lower.includes('terms of service')) return false;
        if (lower.includes('javascript') || lower.includes('function(') || lower.includes('var ')) return false;
        // Prefer caption-like text: has car words or marketing words
        const carWords = ['car', 'vehicle', 'drive', 'dealer', 'offer', 'book', 'test', 'emi', 'buy', 'new', 'launch', 'delivery'];
        return carWords.some((w) => lower.includes(w));
      });

    return [...new Set(candidates)].slice(0, 25);
  } catch {
    return [];
  }
}

// ─── Meta Graph API scraper (requires page access token) ─────────────────────
export async function scrapeWithGraphAPI(
  pageId: string,
  accessToken: string,
): Promise<string[]> {
  try {
    const fields = 'message,story,created_time';
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=${fields}&limit=25&access_token=${accessToken}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const data = await res.json() as { data?: Array<{ message?: string; story?: string }> };
    return (data.data ?? [])
      .map((p) => p.message ?? p.story ?? '')
      .filter((s) => s.length > 20)
      .slice(0, 20);
  } catch {
    return [];
  }
}

// ─── Pattern extractor: detect post type and region signals from text ─────────
export function extractPatterns(posts: string[]): {
  detected_post_types: string[];
  detected_languages: string[];
  common_ctas: string[];
  common_hashtags: string[];
} {
  const allText = posts.join(' ').toLowerCase();
  const detected_post_types: string[] = [];
  const detected_languages: string[] = [];

  // Post type detection
  if (allText.match(/deliver|handed over|congratulat|welcome to the family/)) detected_post_types.push('delivery');
  if (allText.match(/new arrival|just arrived|in stock|launched|introducing/)) detected_post_types.push('new_arrival');
  if (allText.match(/offer|discount|cashback|emi|down payment|exchange/)) detected_post_types.push('offer');
  if (allText.match(/diwali|navratri|holi|festival|festive|puja/)) detected_post_types.push('festival');
  if (allText.match(/review|rating|star|feedback|happy customer/)) detected_post_types.push('testimonial');
  if (allText.match(/electric|ev|charge|battery|range|plug/)) detected_post_types.push('ev');

  // Language detection
  if (allText.match(/abhi|aaj|kal|hum|aap|mein|ka|ke|ki/)) detected_languages.push('hindi');
  if (allText.match(/namma|bengaluru|ooru|illu|namaskara/)) detected_languages.push('kannada');
  if (allText.match(/vanakkam|nandri|ungal|oru|theril/)) detected_languages.push('tamil');
  if (allText.match(/aapli|tumchi|marathi|amchi/)) detected_languages.push('marathi');
  if (allText.match(/tamharo|tamari|su chhe|aavjo/)) detected_languages.push('gujarati');

  // Common CTAs
  const ctaPattern = /(?:call|whatsapp|visit|book|enquire|contact)([\w\s]{5,50})/gi;
  const ctas: string[] = [];
  let m: RegExpExecArray | null;
  const allTextForCTA = posts.join(' ');
  while ((m = ctaPattern.exec(allTextForCTA)) !== null) {
    ctas.push(m[0].slice(0, 60).trim());
  }

  // Hashtags
  const hashtagPattern = /#[\w]+/g;
  const hashtags = (posts.join(' ').match(hashtagPattern) ?? []).map((h) => h.toLowerCase());
  const hashtagFreq = hashtags.reduce<Record<string, number>>((acc, h) => {
    acc[h] = (acc[h] ?? 0) + 1;
    return acc;
  }, {});
  const common_hashtags = Object.entries(hashtagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([h]) => h);

  return {
    detected_post_types: [...new Set(detected_post_types)],
    detected_languages: [...new Set(detected_languages)],
    common_ctas: [...new Set(ctas)].slice(0, 8),
    common_hashtags,
  };
}
