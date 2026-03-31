/// <reference path="../types/puter.d.ts" />

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

/**
 * Builds an image generation prompt from the caption text and original user prompt.
 * The result is kept short and visual — no text overlays, clean automotive scene.
 */
export function buildImagePrompt(captionText: string, userPrompt: string): string {
  // Extract the first sentence of the caption for context
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

  // If already loaded, return src directly
  if (imgEl.complete && imgEl.src) return imgEl.src;

  return new Promise<string>((resolve, reject) => {
    imgEl.onload = () => resolve(imgEl.src);
    imgEl.onerror = () => reject(new Error('Puter image load failed'));
    // 30s timeout
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
 * Main export — tries Puter.js first, then Cloudflare Workers AI as fallback.
 * The image prompt is derived from the caption so the visual matches the copy.
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
