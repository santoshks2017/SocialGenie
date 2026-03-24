import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';
import axios from 'axios';
import { exchangeForLongLivedToken, getPageAccessToken } from '../services/meta.js';



const META_APP_ID     = process.env['META_APP_ID']     ?? '';
const META_APP_SECRET = process.env['META_APP_SECRET'] ?? '';
const GOOGLE_CLIENT_ID     = process.env['GOOGLE_CLIENT_ID']     ?? '';
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
const GOOGLE_REDIRECT_URI  = process.env['GOOGLE_REDIRECT_URI']  ?? 'http://localhost:3001/v1/platforms/callback/google';

export default async function platformRoutes(fastify: FastifyInstance) {
  // GET /v1/platforms  — list all connections for dealer
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request, _reply) => {
    const connections = await prisma.platformConnection.findMany({
      where: { dealer_id: request.user.dealer_id },
    });
    return { success: true, platforms: connections };
  });

  // GET /v1/platforms/connect/:platform  — returns OAuth redirect URL
  fastify.get('/connect/:platform', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const dealer_id = request.user.dealer_id;

    if (platform === 'facebook' || platform === 'instagram') {
      if (!META_APP_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'META_APP_ID not configured' } });
      const scopes = 'pages_manage_posts,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_messages,ads_management';
      const redirectUri = `${process.env['FRONTEND_URL'] ?? 'http://localhost:5173'}/settings?platform=meta`;
      const state = Buffer.from(JSON.stringify({ dealer_id, platform })).toString('base64url');
      const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}`;
      return { success: true, redirect_url: url };
    }

    if (platform === 'gmb') {
      if (!GOOGLE_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'GOOGLE_CLIENT_ID not configured' } });
      const scopes = 'https://www.googleapis.com/auth/business.manage';
      const state = Buffer.from(JSON.stringify({ dealer_id })).toString('base64url');
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${state}`;
      return { success: true, redirect_url: url };
    }

    return reply.code(400).send({ error: { code: 'INVALID_PLATFORM', message: `Unknown platform: ${platform}` } });
  });

  // POST /v1/platforms/callback/meta  — exchange Meta code for token
  fastify.post('/callback/meta', async (request, reply) => {
    const { code, state } = request.body as { code: string; state: string };
    if (!code || !state) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'code and state are required' } });

    let stateData: { dealer_id: string; platform: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return reply.code(400).send({ error: { code: 'INVALID_STATE', message: 'Invalid state parameter' } });
    }

    const redirectUri = `${process.env['FRONTEND_URL'] ?? 'http://localhost:5173'}/settings?platform=meta`;

    // Exchange code for short-lived user token
    const tokenRes = await axios.get<{ access_token: string }>('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { client_id: META_APP_ID, client_secret: META_APP_SECRET, redirect_uri: redirectUri, code },
    });
    const shortLivedToken = tokenRes.data.access_token;

    // Exchange for long-lived token (60 days)
    const { access_token: longLivedToken, expires_in } = await exchangeForLongLivedToken(shortLivedToken);

    // Fetch pages this user manages
    const pagesRes = await axios.get<{ data: Array<{ id: string; name: string }> }>(
      'https://graph.facebook.com/v19.0/me/accounts',
      { params: { access_token: longLivedToken } },
    );
    const page = pagesRes.data.data[0];
    if (!page) return reply.code(400).send({ error: { code: 'NO_PAGE', message: 'No Facebook Page found for this account' } });

    // Get page-level access token (non-expiring)
    const pageToken = await getPageAccessToken(longLivedToken, page.id);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Upsert Facebook connection
    await prisma.platformConnection.upsert({
      where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'facebook' } },
      create: { dealer_id: stateData.dealer_id, platform: 'facebook', platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
      update: { platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
    });

    // Fetch connected IG business account
    const igRes = await axios.get<{ instagram_business_account?: { id: string } }>(
      `https://graph.facebook.com/v19.0/${page.id}`,
      { params: { fields: 'instagram_business_account', access_token: pageToken } },
    );
    const igId = igRes.data.instagram_business_account?.id;
    if (igId) {
      const igNameRes = await axios.get<{ username: string }>(`https://graph.facebook.com/v19.0/${igId}`, { params: { fields: 'username', access_token: pageToken } });
      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'instagram' } },
        create: { dealer_id: stateData.dealer_id, platform: 'instagram', platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
        update: { platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
      });
    }

    return { success: true, page_name: page.name, instagram_connected: !!igId };
  });

  // POST /v1/platforms/callback/google  — exchange Google code for token
  fastify.post('/callback/google', async (request, reply) => {
    const { code, state } = request.body as { code: string; state: string };
    if (!code || !state) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'code and state are required' } });

    let stateData: { dealer_id: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return reply.code(400).send({ error: { code: 'INVALID_STATE', message: 'Invalid state parameter' } });
    }

    // Exchange code for tokens
    const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in: number }>(
      'https://oauth2.googleapis.com/token',
      { code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: GOOGLE_REDIRECT_URI, grant_type: 'authorization_code' },
    );
    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Fetch GMB account/location
    const accountsRes = await axios.get<{ accounts: Array<{ name: string; accountName: string }> }>(
      'https://mybusiness.googleapis.com/v4/accounts',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const account = accountsRes.data.accounts?.[0];
    if (!account) return reply.code(400).send({ error: { code: 'NO_GMB_ACCOUNT', message: 'No Google Business account found' } });

    const locationsRes = await axios.get<{ locations: Array<{ name: string; locationName: string }> }>(
      `https://mybusiness.googleapis.com/v4/${account.name}/locations`,
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const location = locationsRes.data.locations?.[0];
    const locationName = location?.name ?? account.name;
    const displayName = location?.locationName ?? account.accountName;

    await prisma.platformConnection.upsert({
      where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'gmb' } },
      create: {
        dealer_id: stateData.dealer_id, platform: 'gmb',
        platform_account_id: locationName, platform_account_name: displayName,
        access_token, refresh_token: refresh_token ?? null,
        token_expires_at: new Date(Date.now() + expires_in * 1000),
        is_connected: true,
      },
      update: {
        platform_account_id: locationName, platform_account_name: displayName,
        access_token, ...(refresh_token ? { refresh_token } : {}),
        token_expires_at: new Date(Date.now() + expires_in * 1000),
        is_connected: true,
      },
    });

    return { success: true, location_name: displayName };
  });

  // DELETE /v1/platforms/:platform  — disconnect
  fastify.delete('/:platform', {
    preHandler: [fastify.authenticate],
  }, async (request, _reply) => {
    const dealer_id = request.user.dealer_id;
    const { platform } = request.params as { platform: string };
    await prisma.platformConnection.updateMany({
      where: { dealer_id, platform },
      data: { is_connected: false },
    });
    return { success: true, message: `${platform} disconnected` };
  });
}
