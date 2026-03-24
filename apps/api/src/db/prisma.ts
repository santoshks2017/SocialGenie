import 'dotenv/config';
import { PrismaClient } from '../generated/client/index.js';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables. Please check your .env run setup.");
}

export const prisma = new PrismaClient({});
