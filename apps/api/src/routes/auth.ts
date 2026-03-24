import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';



// OTP store — in production use Redis with 10-min TTL
const otpStore = new Map<string, { otp: string; expires: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(phone: string, otp: string): Promise<void> {
  const provider = process.env['OTP_PROVIDER'];

  if (!provider || process.env['NODE_ENV'] === 'development') {
    // Dev mode: log OTP and accept '1234' as universal code
    console.log(`[OTP] ${phone} → ${otp} (dev mode, use 1234 to bypass)`);
    return;
  }

  if (provider === 'twilio') {
    const { default: axios } = await import('axios');
    const sid = process.env['TWILIO_ACCOUNT_SID'];
    const token = process.env['TWILIO_AUTH_TOKEN'];
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      new URLSearchParams({
        Body: `Your Cardeko Social AI OTP is ${otp}. Valid for 10 minutes.`,
        From: process.env['TWILIO_PHONE_NUMBER'] ?? '',
        To: phone,
      }),
      { auth: { username: sid ?? '', password: token ?? '' } },
    );
    return;
  }

  if (provider === 'msg91') {
    const { default: axios } = await import('axios');
    await axios.post('https://api.msg91.com/api/v5/otp', {
      template_id: process.env['MSG91_TEMPLATE_ID'],
      mobile: phone.replace('+', ''),
      authkey: process.env['MSG91_AUTH_KEY'],
      otp,
    });
  }
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /v1/auth/otp/send
  fastify.post('/otp/send', async (request, reply) => {
    const { phone } = request.body as { phone?: string };
    if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Valid phone number is required' } });
    }

    const otp = generateOtp();
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 });

    try {
      await sendOtp(phone, otp);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: { code: 'OTP_SEND_FAILED', message: 'Failed to send OTP' } });
    }

    return { success: true, message: `OTP sent to ${phone}` };
  });

  // POST /v1/auth/otp/verify
  fastify.post('/otp/verify', async (request, reply) => {
    const { phone, otp } = request.body as { phone?: string; otp?: string };
    if (!phone || !otp) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'phone and otp are required' } });
    }

    // Dev bypass
    const isDev = process.env['NODE_ENV'] === 'development';
    const stored = otpStore.get(phone);
    const valid =
      (isDev && otp === '1234') ||
      (stored && stored.otp === otp && stored.expires > Date.now());

    if (!valid) {
      return reply.code(400).send({ error: { code: 'INVALID_OTP', message: 'Incorrect or expired OTP' } });
    }

    otpStore.delete(phone);

    // Upsert dealer record
    const dealer = await prisma.dealer.upsert({
      where: { phone },
      create: { phone, name: 'New Dealer', city: '', onboarding_step: 1 },
      update: {},
    });

    const payload = { dealer_id: dealer.id, phone: dealer.phone };
    const token = fastify.jwt.sign(payload, { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' });
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d' });

    // Store session for audit trail
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await prisma.userSession.create({
      data: {
        dealer_id: dealer.id,
        token_hash: tokenHash,
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] ?? null,
        expires_at: expiresAt,
      },
    });

    // Log login activity
    await prisma.activityLog.create({
      data: {
        dealer_id: dealer.id,
        action: 'auth.login',
        entity_type: 'dealer',
        entity_id: dealer.id,
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] ?? null,
      },
    });

    return {
      token,
      refreshToken,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        onboarding_completed: dealer.onboarding_completed,
        onboarding_step: dealer.onboarding_step,
      },
    };
  });

  // POST /v1/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string };
    if (!refreshToken) {
      return reply.code(400).send({ error: { code: 'MISSING_TOKEN', message: 'refreshToken is required' } });
    }

    try {
      const payload = fastify.jwt.verify<{ dealer_id: string; phone: string }>(refreshToken);
      const token = fastify.jwt.sign(
        { dealer_id: payload.dealer_id, phone: payload.phone },
        { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' },
      );
      return { token };
    } catch {
      return reply.code(401).send({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
    }
  });
}
