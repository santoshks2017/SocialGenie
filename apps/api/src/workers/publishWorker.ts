import { Worker, type Job } from 'bullmq';
import { type Prisma } from '../generated/client/index.js';
import { prisma } from '../db/prisma.js';
import { redisConnection, type PublishJobData } from '../queues/index.js';
import { publishToFacebook, publishToInstagram } from '../services/meta.js';
import { publishToGmb } from '../services/gmb.js';

function toJsonObject(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Prisma.InputJsonObject;
}

export function startPublishWorker() {
  const worker = new Worker<PublishJobData>(
    'publish',
    async (job: Job<PublishJobData>) => {
      const { post_id, dealer_id, platform, image_url, caption, access_token } = job.data;

      await prisma.post.update({
        where: { id: post_id },
        data: { status: 'publishing' },
      });

      let platformPostId: string;
      let platformUrl: string;

      try {
        if (platform === 'facebook') {
          const pageId = job.data.page_id;
          if (!pageId) throw new Error('page_id required for Facebook publish');
          const result = await publishToFacebook(pageId, access_token, image_url, caption);
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else if (platform === 'instagram') {
          const igUserId = job.data.ig_user_id;
          if (!igUserId) throw new Error('ig_user_id required for Instagram publish');
          const result = await publishToInstagram(igUserId, access_token, image_url, caption);
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else if (platform === 'gmb') {
          const locationName = job.data.gmb_location_name;
          if (!locationName) throw new Error('gmb_location_name required for GMB publish');
          const result = await publishToGmb(
            locationName,
            access_token,
            image_url,
            caption.slice(0, 1500),  // GMB limit
            job.data.dealer_phone ? { actionType: 'CALL', phone: job.data.dealer_phone } : undefined,
          );
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else {
          throw new Error(`Unknown platform: ${platform}`);
        }

        // Persist the publish result
        const existing = await prisma.post.findUnique({ where: { id: post_id } });
        const prevResults = toJsonObject(existing?.publish_results);
        await prisma.post.update({
          where: { id: post_id },
          data: {
            status: 'published',
            published_at: new Date(),
            publish_results: {
              ...prevResults,
              [platform]: { post_id: platformPostId, url: platformUrl, published_at: new Date().toISOString() },
            } as Prisma.InputJsonObject,
          },
        });

        console.log(`[publish-worker] ${platform} post ${platformPostId} published for dealer ${dealer_id}`);
        return { platform, post_id: platformPostId, url: platformUrl };

      } catch (err) {
        // Mark this platform as failed in publish_results
        const existing = await prisma.post.findUnique({ where: { id: post_id } });
        const prevResults = toJsonObject(existing?.publish_results);
        await prisma.post.update({
          where: { id: post_id },
          data: {
            publish_results: {
              ...prevResults,
              [platform]: { error: (err as Error).message, failed_at: new Date().toISOString() },
            } as Prisma.InputJsonObject,
          },
        });
        throw err; // let BullMQ handle retries
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { post_id, platform } = job.data;
    console.error(`[publish-worker] FINAL FAILURE platform=${platform} post=${post_id}:`, err.message);
    // TODO: send push notification to dealer
  });

  console.log('[publish-worker] started');
  return worker;
}
