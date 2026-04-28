import { Worker, type Job } from 'bullmq';
import { redisConnection, type PublishJobData } from '../queues/index.js';
import { publishPostToPlatform } from '../lib/publishDirect.js';

export function startPublishWorker() {
  const worker = new Worker<PublishJobData>(
    'publish',
    async (job: Job<PublishJobData>) => {
      const { post_id, dealer_id, platform } = job.data;
      const result = await publishPostToPlatform(job.data);
      console.log(`[publish-worker] ${platform} post ${result.platform_post_id} published for dealer ${dealer_id}`);
      return { platform, post_id: result.platform_post_id, url: result.url };
    },
    { connection: redisConnection, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    if (!job) return;
    console.error(`[publish-worker] FINAL FAILURE platform=${job.data.platform} post=${job.data.post_id}:`, err.message);
  });

  console.log('[publish-worker] started');
  return worker;
}
