/// <reference path="../types/puter.d.ts" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

/**
 * Builds a short headline from caption text (mirrors extractHeadline on the backend).
 * Used as the template overlay text and as context for image generation.
 */
export function buildHeadline(captionText: string, userPrompt: string): string {
  const first = captionText.split(/[.!?\n]/)[0]?.trim() ?? '';
  const source = first || userPrompt;
  if (source.length <= 70) return source;
  const cut = source.slice(0, 70);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 30 ? `${cut.slice(0, lastSpace)}...` : `${cut}...`;
}

/**
 * Builds an image generation prompt from the caption text and original user prompt.
 * The result is kept short and visual — no text overlays, clean automotive scene.
 */
export function buildImagePrompt(captionText: string, userPrompt: string): string {
  const captionSnippet = captionText.split(/[.!?\n]/)[0]?.trim().slice(0, 120) ?? '';
  const context = captionSnippet || userPrompt.slice(0, 100);
  return `Professional automotive photography for Indian car dealership. ${context}. Photorealistic, cinematic lighting, 4K quality, no text overlay, clean background, showroom setting.`;
}

/**
 * Primary: Puter.js client-side image generation — no API key, no billing.
 * Returns a data URL or blob URL from the generated HTMLImageElement.
 */
async function generateWithPuter(imagePrompt: string): Promise<string> {
  if (!window.puter?.ai?.txt2img) throw new Error('Puter.js not loaded');

  const imgEl = await window.puter.ai.txt2img(imagePrompt);

  if (imgEl.complete && imgEl.src) return imgEl.src;

  return new Promise<string>((resolve, reject) => {
    imgEl.onload = () => resolve(imgEl.src);
    imgEl.onerror = () => reject(new Error('Puter image load failed'));
    setTimeout(() => reject(new Error('Puter image timeout')), 30_000);
  });
}

/**
 * Fallback: Cloudflare Workers AI via our backend (keeps API token server-side).
 * Returns a base64 data URL.
 */
async function generateWithCloudflare(imagePrompt: string): Promise<string> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE_URL}/creatives/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt: imagePrompt }),
    signal: AbortSignal.timeout(50_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Image generation failed (${res.status})`);
  }

  const data = await res.json() as { image: string };
  return `data:image/png;base64,${data.image}`;
}

/**
 * Backend branded creative: Cloudflare SDXL image → Sharp template composite.
 * Returns a CDN/storage URL to the fully branded creative (with dealer overlay).
 * Throws if the backend returns 503 (CF not configured) so callers can fall back.
 */
async function generateBrandedWithBackend(
  headline: string,
  templateIndex: 0 | 1 | 2,
): Promise<string> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE_URL}/creatives/generate-branded`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ headline, template_index: templateIndex }),
    signal: AbortSignal.timeout(65_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { code?: string; message?: string } };
    throw new Error(err.error?.message ?? `Branded generation failed (${res.status})`);
  }

  const data = await res.json() as { url: string };
  if (!data.url) throw new Error('No URL returned from branded generation');
  return data.url;
}

/**
 * Generates a fully branded creative for a given caption variant.
 *
 * Priority chain:
 *   1. Backend branded (Cloudflare SDXL + Sharp template) — best quality, fully branded
 *   2. Puter.js (client-side DALL-E, raw, no branding) — fast fallback
 *   3. Cloudflare raw (backend SDXL, base64, no branding) — last resort
 */
export async function generateBrandedCreative(
  captionText: string,
  userPrompt: string,
  variantIndex: number,
): Promise<string> {
  const headline = buildHeadline(captionText, userPrompt);
  const templateIndex = Math.min(variantIndex, 2) as 0 | 1 | 2;

  // 1. Try backend branded (CF SDXL + template overlay)
  try {
    return await generateBrandedWithBackend(headline, templateIndex);
  } catch (e) {
    console.warn('[ImageGen] Backend branded failed, trying Puter.js:', e);
  }

  // 2. Try Puter.js (fast client-side, raw image)
  const imagePrompt = buildImagePrompt(captionText, userPrompt);
  try {
    return await generateWithPuter(imagePrompt);
  } catch (e) {
    console.warn('[ImageGen] Puter.js failed, trying raw Cloudflare:', e);
  }

  // 3. Raw Cloudflare via backend
  return await generateWithCloudflare(imagePrompt);
}

/**
 * Legacy export — kept for any existing callers.
 * Tries Puter.js first, then Cloudflare raw backend.
 */
export async function generateImage(captionText: string, userPrompt: string): Promise<string> {
  const imagePrompt = buildImagePrompt(captionText, userPrompt);

  try {
    return await generateWithPuter(imagePrompt);
  } catch (e) {
    console.warn('[ImageGen] Puter.js failed, trying Cloudflare fallback:', e);
  }

  return await generateWithCloudflare(imagePrompt);
}
