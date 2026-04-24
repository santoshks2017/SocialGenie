import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadFile } from '../lib/storage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.join(__dirname, '../../../uploads');
export const ORIGINALS_DIR = path.join(UPLOADS_ROOT, 'originals');
export const CREATIVES_DIR = path.join(UPLOADS_ROOT, 'creatives');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.webm', '.mkv']);

export default async function uploadRoutes(fastify: FastifyInstance) {
  // POST /v1/upload/image
  // Auth is optional — demo users without a real JWT can still upload
  fastify.post('/image', async (request, reply) => {
    // Attempt auth silently; continue even if it fails
    try { await fastify.authenticate(request, reply); } catch { /* allow anonymous */ }
    if (reply.sent) return; // authenticate already sent a response (shouldn't happen with try/catch but guard)

    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file provided' });

    let ext = path.extname(data.filename).toLowerCase();
    if (!ext) {
      // Fallback to mimetype if filename has no extension
      if (data.mimetype === 'image/png') ext = '.png';
      else if (data.mimetype === 'image/webp') ext = '.webp';
      else if (data.mimetype === 'image/heic') ext = '.heic';
      else ext = '.jpg';
    }

    if (!IMAGE_EXTS.has(ext)) {
      return reply.code(400).send({ error: `Unsupported image type. Allowed: ${[...IMAGE_EXTS].join(', ')}` });
    }

    await mkdir(ORIGINALS_DIR, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const buffer = await data.toBuffer();
    const url = await uploadFile(buffer, `originals/${filename}`, data.mimetype || 'image/jpeg', ORIGINALS_DIR);

    return { id: filename, url };
  });

  // POST /v1/upload/video
  fastify.post('/video', async (request, reply) => {
    try { await fastify.authenticate(request, reply); } catch { /* allow anonymous */ }
    if (reply.sent) return;

    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No file provided' });

    let ext = path.extname(data.filename).toLowerCase();
    if (!ext) {
      if (data.mimetype === 'video/quicktime') ext = '.mov';
      else if (data.mimetype === 'video/webm') ext = '.webm';
      else ext = '.mp4';
    }

    if (!VIDEO_EXTS.has(ext)) {
      return reply.code(400).send({ error: `Unsupported video type. Allowed: ${[...VIDEO_EXTS].join(', ')}` });
    }

    await mkdir(ORIGINALS_DIR, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    const buffer = await data.toBuffer();
    const url = await uploadFile(buffer, `originals/${filename}`, data.mimetype || 'video/mp4', ORIGINALS_DIR);

    return { id: filename, url };
  });
}
