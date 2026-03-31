const CF_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';
const IMAGE_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';

export function isCloudflareAvailable(): boolean {
  return !!(process.env['CLOUDFLARE_ACCOUNT_ID'] && process.env['CLOUDFLARE_API_TOKEN']);
}

export async function generateImage(prompt: string): Promise<Buffer> {
  const accountId = process.env['CLOUDFLARE_ACCOUNT_ID'];
  const apiToken = process.env['CLOUDFLARE_API_TOKEN'];
  if (!accountId || !apiToken) throw new Error('Cloudflare AI credentials not configured');

  const url = `${CF_API_BASE}/${accountId}/ai/run/${IMAGE_MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) throw new Error(`Cloudflare AI ${res.status}: ${await res.text()}`);

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
