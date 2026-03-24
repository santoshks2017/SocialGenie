import { Queue } from 'bullmq';

const redisConnection = {
  host: (process.env['REDIS_URL'] ?? 'redis://localhost:6379').replace('redis://', '').split(':')[0] ?? 'localhost',
  port: parseInt((process.env['REDIS_URL'] ?? 'redis://localhost:6379').split(':')[2] ?? '6379'),
};

// ─── Queues ────────────────────────────────────────────────────────────────────

export const publishQueue = new Queue('publish', { connection: redisConnection });
export const metricsQueue = new Queue('metrics', { connection: redisConnection });
export const inboxPollQueue = new Queue('inbox-poll', { connection: redisConnection });
export const captionQueue = new Queue('caption', { connection: redisConnection });

// ─── Job type definitions ──────────────────────────────────────────────────────

export interface PublishJobData {
  post_id: string;
  dealer_id: string;
  platform: 'facebook' | 'instagram' | 'gmb';
  image_url: string;
  caption: string;
  page_id?: string;
  ig_user_id?: string;
  gmb_location_name?: string;
  access_token: string;
  dealer_phone?: string;
  dealer_whatsapp?: string;
}

export interface MetricsJobData {
  post_id: string;
  dealer_id: string;
  platform: 'facebook' | 'instagram' | 'gmb';
  platform_post_id: string;
  access_token: string;
}

export interface InboxPollJobData {
  dealer_id: string;
  platform: 'facebook' | 'instagram' | 'google';
  platform_account_id: string;
  access_token: string;
}

export interface CaptionJobData {
  generation_id: string;
  dealer_id: string;
  prompt: string;
  dealer_context: {
    name: string;
    city: string;
    brands: string[];
    phone: string;
    whatsapp: string;
    language_preferences: string[];
  };
  inventory_context?: {
    make?: string;
    model?: string;
    variant?: string;
    price?: number;
    features?: string[];
    stock_count?: number;
  };
}

export { redisConnection };
