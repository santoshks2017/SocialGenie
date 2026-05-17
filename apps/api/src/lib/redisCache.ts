import { Redis } from 'ioredis';
import type { Redis as RedisType } from 'ioredis';

let client: RedisType | null = null;

function getClient(): RedisType | null {
  const url = process.env['REDIS_URL'];
  if (!url) return null;
  if (!client) {
    client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    client.on('error', (err: Error) => {
      console.error('[RedisCache] connection error:', err.message);
    });
  }
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getClient();
  if (!r) return null;
  try {
    const val = await r.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const r = getClient();
  if (!r) return;
  try {
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Non-fatal — degrade gracefully without caching
  }
}
