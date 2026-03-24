import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.join(__dirname, '../../../uploads');
export const ORIGINALS_DIR = path.join(UPLOADS_ROOT, 'originals');
export const CREATIVES_DIR = path.join(UPLOADS_ROOT, 'creatives');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.webm', '.mkv']);

export default async function uploadRoutes(fastify: FastifyInstance) {
  // POST /v1/upload/image
  fastify.post('/image', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file provided' });

    const ext = path.extname(data.filename).toLowerCase() || '.jpg';
    if (!IMAGE_EXTS.has(ext)) {
      return reply.code(400).send({ error: `Unsupported image type. Allowed: ${[...IMAGE_EXTS].join(', ')}` });
    }

    await mkdir(ORIGINALS_DIR, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const buffer = await data.toBuffer();
    await writeFile(path.join(ORIGINALS_DIR, filename), buffer);

    const baseUrl = process.env['API_BASE_URL'] ?? 'http://localhost:3001';
    return { id: filename, url: `${baseUrl}/uploads/originals/${filename}` };
  });

  // POST /v1/upload/video
  fastify.post('/video', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file provided' });

    const ext = path.extname(data.filename).toLowerCase() || '.mp4';
    if (!VIDEO_EXTS.has(ext)) {
      return reply.code(400).send({ error: `Unsupported video type. Allowed: ${[...VIDEO_EXTS].join(', ')}` });
    }

    await mkdir(ORIGINALS_DIR, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const buffer = await data.toBuffer();
    await writeFile(path.join(ORIGINALS_DIR, filename), buffer);

    const baseUrl = process.env['API_BASE_URL'] ?? 'http://localhost:3001';
    return { id: filename, url: `${baseUrl}/uploads/originals/${filename}` };
  });
}
