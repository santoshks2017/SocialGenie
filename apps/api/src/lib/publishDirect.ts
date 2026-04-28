import type { Prisma } from '../generated/client/index.js';
import { prisma } from '../db/prisma.js';
import { publishToFacebook, publishToInstagram } from '../services/meta.js';
import { publishToGmb } from '../services/gmb.js';

export interface PublishDirectData {
  post_id: string;
  dealer_id: string;
  platform: 'facebook' | 'instagram' | 'gmb';
  image_url: string;
  caption: string;
  access_token: string;
  page_id?: string;
  ig_user_id?: string;
  gmb_location_name?: string;
  dealer_phone?: string;
  dealer_whatsapp?: string;
}

function toJsonObject(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Prisma.InputJsonObject;
}

export async function publishPostToPlatform(
  data: PublishDirectData,
): Promise<{ platform_post_id: string; url: string }> {
  const { post_id, platform, image_url, caption, access_token } = data;

  await prisma.post.update({ where: { id: post_id }, data: { status: 'publishing' } });

  let platformPostId: string;
  let platformUrl: string;

  try {
    if (platform === 'facebook') {
      if (!data.page_id) throw new Error('page_id required for Facebook publish');
      const result = await publishToFacebook(data.page_id, access_token, image_url, caption);
      platformPostId = result.post_id;
      platformUrl = result.url;
    } else if (platform === 'instagram') {
      if (!data.ig_user_id) throw new Error('ig_user_id required for Instagram publish');
      const result = await publishToInstagram(data.ig_user_id, access_token, image_url, caption);
      platformPostId = result.post_id;
      platformUrl = result.url;
    } else if (platform === 'gmb') {
      if (!data.gmb_location_name) throw new Error('gmb_location_name required for GMB publish');
      const result = await publishToGmb(
        data.gmb_location_name,
        access_token,
        image_url,
        caption.slice(0, 1500),
        data.dealer_phone ? { actionType: 'CALL', phone: data.dealer_phone } : undefined,
      );
      platformPostId = result.post_id;
      platformUrl = result.url;
    } else {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const existing = await prisma.post.findUnique({ where: { id: post_id } });
    const prevResults = toJsonObject(existing?.publish_results);
    await prisma.post.update({
      where: { id: post_id },
      data: {
        status: 'published',
        published_at: new Date(),
        publish_results: {
          ...prevResults,
          [platform]: {
            post_id: platformPostId,
            url: platformUrl,
            published_at: new Date().toISOString(),
          },
        } as Prisma.InputJsonObject,
      },
    });

    return { platform_post_id: platformPostId, url: platformUrl };
  } catch (err) {
    const existing = await prisma.post.findUnique({ where: { id: post_id } });
    const prevResults = toJsonObject(existing?.publish_results);
    await prisma.post.update({
      where: { id: post_id },
      data: {
        status: 'failed',
        publish_results: {
          ...prevResults,
          [platform]: { error: (err as Error).message, failed_at: new Date().toISOString() },
        } as Prisma.InputJsonObject,
      },
    });
    throw err;
  }
}
