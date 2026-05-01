import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';
import axios from 'axios';
import crypto from 'crypto';
import { exchangeForLongLivedToken, getPageAccessToken } from '../services/meta.js';

// ── Credentials (set in .env) ─────────────────────────────────────────────────
const META_APP_ID          = process.env['META_APP_ID']          ?? '';
const META_APP_SECRET      = process.env['META_APP_SECRET']      ?? '';
const GOOGLE_CLIENT_ID     = process.env['GOOGLE_CLIENT_ID']     ?? '';
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
const LINKEDIN_CLIENT_ID     = process.env['LINKEDIN_CLIENT_ID']     ?? '';
const LINKEDIN_CLIENT_SECRET = process.env['LINKEDIN_CLIENT_SECRET'] ?? '';
const TWITTER_CLIENT_ID    = process.env['TWITTER_CLIENT_ID']    ?? '';
const TIKTOK_APP_KEY       = process.env['TIKTOK_APP_KEY']       ?? '';
const TIKTOK_APP_SECRET    = process.env['TIKTOK_APP_SECRET']    ?? '';
const PINTEREST_APP_ID     = process.env['PINTEREST_APP_ID']     ?? '';
const PINTEREST_APP_SECRET = process.env['PINTEREST_APP_SECRET'] ?? '';

const API_BASE_URL = process.env['API_BASE_URL'] ?? `http://localhost:${process.env['PORT'] ?? 3001}`;
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';

// ── Callback URIs — register each one in the platform developer console ───────
const META_CALLBACK_URI      = `${API_BASE_URL}/v1/platforms/callback/meta`;
const GOOGLE_CALLBACK_URI    = `${API_BASE_URL}/v1/platforms/callback/google`;
const YOUTUBE_CALLBACK_URI   = `${API_BASE_URL}/v1/platforms/callback/youtube`;
const LINKEDIN_CALLBACK_URI  = `${API_BASE_URL}/v1/platforms/callback/linkedin`;
const TWITTER_CALLBACK_URI   = `${API_BASE_URL}/v1/platforms/callback/twitter`;
const TIKTOK_CALLBACK_URI    = `${API_BASE_URL}/v1/platforms/callback/tiktok`;
const PINTEREST_CALLBACK_URI = `${API_BASE_URL}/v1/platforms/callback/pinterest`;
const THREADS_CALLBACK_URI   = `${API_BASE_URL}/v1/platforms/callback/threads`;

// ── PKCE store for Twitter OAuth 2.0 (in-memory, 10-min TTL) ─────────────────
// Replace with Redis in a multi-instance deployment.
const pkceStore = new Map<string, { codeVerifier: string; dealer_id: string | null }>();

// ── Helpers ───────────────────────────────────────────────────────────────────
function encodeState(data: object): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}
function decodeState<T>(state: string): T {
  return JSON.parse(Buffer.from(state, 'base64url').toString()) as T;
}
function accountsSuccess(platform: string, name: string): string {
  return `${FRONTEND_URL}/accounts?oauth_success=${encodeURIComponent(platform)}&page_name=${encodeURIComponent(name)}`;
}
function accountsError(msg: string, platform: string): string {
  return `${FRONTEND_URL}/accounts?oauth_error=${encodeURIComponent(msg)}&platform=${encodeURIComponent(platform)}`;
}
// SettingsPage still uses this URL for its own connect buttons
function settingsSuccess(platform: string, name: string): string {
  return `${FRONTEND_URL}/settings?tab=platforms&oauth_success=${encodeURIComponent(platform)}&page_name=${encodeURIComponent(name)}`;
}
function settingsError(msg: string, platform: string): string {
  return `${FRONTEND_URL}/settings?tab=platforms&oauth_error=${encodeURIComponent(msg)}&platform=${encodeURIComponent(platform)}`;
}

export default async function platformRoutes(fastify: FastifyInstance) {
  // ── GET /v1/platforms — list all connections ─────────────────────────────
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request) => {
    const connections = await prisma.platformConnection.findMany({
      where: { dealer_id: request.user.dealer_id! },
    });
    return { success: true, platforms: connections };
  });

  // ── GET /v1/platforms/connect/:platform — build & return OAuth URL ────────
  // Default mode (no ?signin=1): requires JWT, links platform to dealer account.
  // ?signin=1: no auth required, creates dealer account via social sign-in.
  fastify.get('/connect/:platform', async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const { signin } = request.query as { signin?: string };
    const isSignin = signin === '1';

    let dealer_id: string | null = null;
    if (!isSignin) {
      try {
        await request.jwtVerify();
        dealer_id = request.user.dealer_id ?? null;
      } catch {
        return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required to link platforms' } });
      }
    }

    // ── Facebook / Instagram (Meta) ──────────────────────────────────────────
    if (platform === 'facebook' || platform === 'instagram') {
      if (!META_APP_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'META_APP_ID not configured' } });
      const scopes = [
        'pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata',
        'pages_messaging', 'instagram_basic', 'instagram_content_publish',
        'instagram_manage_comments', 'instagram_manage_messages', 'ads_management',
      ].join(',');
      const state = encodeState({ dealer_id, platform, signin: isSignin });
      const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
      url.searchParams.set('client_id', META_APP_ID);
      url.searchParams.set('redirect_uri', META_CALLBACK_URI);
      url.searchParams.set('scope', scopes);
      url.searchParams.set('state', state);
      url.searchParams.set('response_type', 'code');
      return { success: true, redirect_url: url.toString() };
    }

    // ── Google Business Profile ───────────────────────────────────────────────
    if (platform === 'gmb') {
      if (!GOOGLE_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'GOOGLE_CLIENT_ID not configured' } });
      const state = encodeState({ dealer_id, signin: isSignin });
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      url.searchParams.set('redirect_uri', GOOGLE_CALLBACK_URI);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'https://www.googleapis.com/auth/business.manage email profile');
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    // ── YouTube ────────────────────────────────────────────────────────────────
    if (platform === 'youtube') {
      if (!GOOGLE_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'GOOGLE_CLIENT_ID not configured' } });
      const state = encodeState({ dealer_id });
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      url.searchParams.set('redirect_uri', YOUTUBE_CALLBACK_URI);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '));
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('include_granted_scopes', 'true');
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    // ── LinkedIn ───────────────────────────────────────────────────────────────
    if (platform === 'linkedin') {
      if (!LINKEDIN_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'LINKEDIN_CLIENT_ID not configured' } });
      const state = encodeState({ dealer_id });
      const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
      url.searchParams.set('redirect_uri', LINKEDIN_CALLBACK_URI);
      url.searchParams.set('scope', 'r_basicprofile w_member_social rw_organization_admin w_organization_social r_organization_social r_organization_followers');
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    // ── X / Twitter (OAuth 2.0 + PKCE) ───────────────────────────────────────
    if (platform === 'twitter') {
      if (!TWITTER_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'TWITTER_CLIENT_ID not configured' } });
      const codeVerifier  = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
      const stateKey      = crypto.randomBytes(16).toString('hex');
      pkceStore.set(stateKey, { codeVerifier, dealer_id });
      setTimeout(() => pkceStore.delete(stateKey), 10 * 60 * 1000);
      const url = new URL('https://twitter.com/i/oauth2/authorize');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', TWITTER_CLIENT_ID);
      url.searchParams.set('redirect_uri', TWITTER_CALLBACK_URI);
      url.searchParams.set('scope', 'tweet.read tweet.write users.read media.write offline.access');
      url.searchParams.set('state', stateKey);
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      return { success: true, redirect_url: url.toString() };
    }

    // ── TikTok ─────────────────────────────────────────────────────────────────
    if (platform === 'tiktok') {
      if (!TIKTOK_APP_KEY) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'TIKTOK_APP_KEY not configured' } });
      const state = encodeState({ dealer_id });
      const url = new URL('https://www.tiktok.com/v2/auth/authorize');
      url.searchParams.set('client_key', TIKTOK_APP_KEY);
      url.searchParams.set('scope', 'user.info.basic,video.upload,video.list');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('redirect_uri', TIKTOK_CALLBACK_URI);
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    // ── Pinterest ──────────────────────────────────────────────────────────────
    if (platform === 'pinterest') {
      if (!PINTEREST_APP_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'PINTEREST_APP_ID not configured' } });
      const state = encodeState({ dealer_id });
      const url = new URL('https://www.pinterest.com/oauth');
      url.searchParams.set('client_id', PINTEREST_APP_ID);
      url.searchParams.set('redirect_uri', PINTEREST_CALLBACK_URI);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'boards:read,boards:write,pins:read,pins:write,user_accounts:read');
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    // ── Threads ────────────────────────────────────────────────────────────────
    if (platform === 'threads') {
      const THREADS_APP_ID = process.env['THREADS_APP_ID'] ?? META_APP_ID;
      if (!THREADS_APP_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'THREADS_APP_ID not configured' } });
      const state = encodeState({ dealer_id });
      const url = new URL('https://threads.net/oauth/authorize');
      url.searchParams.set('client_id', THREADS_APP_ID);
      url.searchParams.set('redirect_uri', THREADS_CALLBACK_URI);
      url.searchParams.set('scope', 'threads_basic,threads_content_publish,threads_manage_insights');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('state', state);
      return { success: true, redirect_url: url.toString() };
    }

    return reply.code(400).send({ error: { code: 'INVALID_PLATFORM', message: `Unknown platform: ${platform}` } });
  });

  // ── POST /v1/platforms/connect/bluesky — AT Protocol (no redirect) ────────
  fastify.post('/connect/bluesky', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const dealer_id = request.user.dealer_id!;
    const { handle, appPassword } = request.body as { handle?: string; appPassword?: string };

    if (!handle || !appPassword) {
      return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'handle and appPassword are required' } });
    }
    try {
      const sessionRes = await axios.post<{ accessJwt: string; refreshJwt: string; did: string; handle: string }>(
        'https://bsky.social/xrpc/com.atproto.server.createSession',
        { identifier: handle.replace(/^@/, ''), password: appPassword },
      );
      const { accessJwt, refreshJwt, did, handle: resolvedHandle } = sessionRes.data;
      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'bluesky' } },
        create: { dealer_id, platform: 'bluesky', account_type: 'profile', platform_account_id: did, platform_account_name: `@${resolvedHandle}`, access_token: accessJwt, refresh_token: refreshJwt, is_connected: true },
        update: { platform_account_id: did, platform_account_name: `@${resolvedHandle}`, access_token: accessJwt, refresh_token: refreshJwt, is_connected: true },
      });
      return { success: true, account: { did, handle: resolvedHandle } };
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 400) {
        return reply.code(401).send({ error: { code: 'AUTH_FAILED', message: 'Invalid handle or app password. Use an App Password, not your main Bluesky password.' } });
      }
      fastify.log.error(err, 'Bluesky connection failed');
      return reply.code(500).send({ error: { code: 'CONNECTION_FAILED', message: 'Failed to connect to Bluesky.' } });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // OAuth Callbacks
  // ═══════════════════════════════════════════════════════════════════════════

  // ── GET /v1/platforms/callback/meta (Facebook + Instagram) ───────────────
  fastify.get('/callback/meta', async (request, reply) => {
    const { code, state, error: oauthError, error_description } = request.query as {
      code?: string; state?: string; error?: string; error_description?: string;
    };

    if (oauthError || !code || !state) {
      const msg = error_description ?? oauthError ?? 'Missing code or state';
      fastify.log.warn({ oauthError }, 'Meta OAuth denied or missing params');
      return reply.redirect(accountsError(msg, 'facebook'));
    }

    let stateData: { dealer_id: string | null; platform?: string; signin?: boolean };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state parameter', 'facebook')); }

    try {
      // 1. Exchange for short-lived user access token
      const tokenRes = await axios.get<{ access_token: string }>(
        'https://graph.facebook.com/v19.0/oauth/access_token',
        { params: { client_id: META_APP_ID, client_secret: META_APP_SECRET, redirect_uri: META_CALLBACK_URI, code } },
      );
      const shortLivedToken = tokenRes.data.access_token;

      // 2. Exchange for long-lived token (60 days)
      const { access_token: longLivedToken, expires_in } = await exchangeForLongLivedToken(shortLivedToken);
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // 3. Fetch user info + Facebook Pages
      const [meRes, pagesRes] = await Promise.all([
        axios.get<{ id: string; name: string; email?: string }>('https://graph.facebook.com/v19.0/me', {
          params: { fields: 'id,name,email', access_token: longLivedToken },
        }),
        axios.get<{ data: Array<{ id: string; name: string }> }>('https://graph.facebook.com/v19.0/me/accounts', {
          params: { access_token: longLivedToken },
        }),
      ]);
      const fbUser = meRes.data;
      const page = pagesRes.data.data[0];

      if (!page) {
        const errMsg = stateData.signin
          ? 'No Facebook Page found. Please create a Facebook Business Page first, then try again.'
          : 'No Facebook Page found. Create a Facebook Page first.';
        return reply.redirect(accountsError(errMsg, 'facebook'));
      }

      // 4. Get non-expiring Page access token
      const pageToken = await getPageAccessToken(longLivedToken, page.id);

      // ── Social Sign-In Mode ──────────────────────────────────────────────
      let dealerId = stateData.dealer_id;
      let accessTokenForJwt: string | null = null;
      let refreshTokenForJwt: string | null = null;

      if (stateData.signin) {
        const fbPhone = `fb_${fbUser.id}`;
        let dealer = await prisma.dealer.findFirst({ where: { phone: fbPhone } });
        if (!dealer) {
          dealer = await prisma.dealer.create({
            data: { phone: fbPhone, name: page.name, city: '', contact_phone: '', onboarding_completed: false, onboarding_step: 2 },
          });
        }
        dealerId = dealer.id;
        let dealerUser = await prisma.dealerUser.findFirst({ where: { dealer_id: dealer.id } });
        if (!dealerUser) {
          dealerUser = await prisma.dealerUser.create({
            data: { phone: `fb_user_${fbUser.id}`, name: fbUser.name, email: fbUser.email ?? null, role: 'admin', dealer_id: dealer.id, is_active: true },
          });
        }
        const { resolvePermissions } = await import('../lib/permissions.js');
        type JwtUser = { dealer_user_id: string; dealer_id: string | null; role: 'owner' | 'admin' | 'user'; phone: string; permissions: Record<string, boolean> };
        const jwtPayload: JwtUser = { dealer_user_id: dealerUser.id, dealer_id: dealer.id, role: 'admin', phone: `fb_user_${fbUser.id}`, permissions: resolvePermissions(dealerUser.role) };
        accessTokenForJwt = fastify.jwt.sign(jwtPayload, { expiresIn: '30d' });
        refreshTokenForJwt = fastify.jwt.sign(jwtPayload, { expiresIn: '90d' });
      }

      if (!dealerId) return reply.redirect(accountsError('Session expired. Please try again.', 'facebook'));

      // 5. Save Facebook connection
      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id: dealerId, platform: 'facebook' } },
        create: { dealer_id: dealerId, platform: 'facebook', account_type: 'page', platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
        update: { account_type: 'page', platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
      });

      // 6. Auto-link Instagram Business account if available
      let igConnected = false;
      try {
        const igRes = await axios.get<{ instagram_business_account?: { id: string } }>(
          `https://graph.facebook.com/v19.0/${page.id}`,
          { params: { fields: 'instagram_business_account', access_token: pageToken } },
        );
        const igId = igRes.data.instagram_business_account?.id;
        if (igId) {
          const igNameRes = await axios.get<{ username: string }>(
            `https://graph.facebook.com/v19.0/${igId}`,
            { params: { fields: 'username', access_token: pageToken } },
          );
          await prisma.platformConnection.upsert({
            where: { dealer_id_platform: { dealer_id: dealerId, platform: 'instagram' } },
            create: { dealer_id: dealerId, platform: 'instagram', account_type: 'business', platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
            update: { account_type: 'business', platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
          });
          igConnected = true;
        }
      } catch (igErr) {
        fastify.log.warn(igErr, 'Could not fetch Instagram Business account');
      }

      const connected = igConnected ? 'facebook,instagram' : 'facebook';

      if (stateData.signin && accessTokenForJwt) {
        return reply.redirect(
          `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(accessTokenForJwt)}&refresh=${encodeURIComponent(refreshTokenForJwt ?? '')}&platform=${encodeURIComponent(connected)}&page_name=${encodeURIComponent(page.name)}`
        );
      }
      return reply.redirect(accountsSuccess(connected, page.name));

    } catch (err) {
      fastify.log.error(err, 'Meta OAuth callback failed');
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Connection failed';
      return reply.redirect(accountsError(msg, 'facebook'));
    }
  });

  // ── GET /v1/platforms/callback/google (Google Business Profile) ───────────
  fastify.get('/callback/google', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };

    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'Google login cancelled', 'gmb'));

    let stateData: { dealer_id: string | null; signin?: boolean };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'gmb')); }

    try {
      const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in: number }>(
        'https://oauth2.googleapis.com/token',
        { code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: GOOGLE_CALLBACK_URI, grant_type: 'authorization_code' },
      );
      const { access_token, refresh_token, expires_in } = tokenRes.data;

      const googleUserRes = await axios.get<{ id: string; name: string; email?: string }>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } },
      ).catch(() => ({ data: { id: '', name: 'Google User', email: undefined } }));
      const googleUser = googleUserRes.data;

      const accountsRes = await axios.get<{ accounts: Array<{ name: string; accountName: string }> }>(
        'https://mybusiness.googleapis.com/v4/accounts',
        { headers: { Authorization: `Bearer ${access_token}` } },
      ).catch(() => ({ data: { accounts: [] } }));
      const account = accountsRes.data.accounts?.[0];

      let locationName = account?.name ?? `google_${googleUser.id}`;
      let displayName  = account?.accountName ?? googleUser.name;
      if (account) {
        try {
          const locRes = await axios.get<{ locations: Array<{ name: string; locationName: string }> }>(
            `https://mybusiness.googleapis.com/v4/${account.name}/locations`,
            { headers: { Authorization: `Bearer ${access_token}` } },
          );
          const loc = locRes.data.locations?.[0];
          if (loc) { locationName = loc.name; displayName = loc.locationName; }
        } catch { /* fallback to account level */ }
      }

      let dealerId = stateData.dealer_id;
      let jwtToken: string | null = null;
      let jwtRefresh: string | null = null;

      if (stateData.signin) {
        const gPhone = `google_${googleUser.id || Date.now()}`;
        let dealer = await prisma.dealer.findFirst({ where: { phone: gPhone } });
        if (!dealer) {
          dealer = await prisma.dealer.create({
            data: { phone: gPhone, name: displayName, city: '', contact_phone: '', onboarding_completed: false, onboarding_step: 2 },
          });
        }
        dealerId = dealer.id;
        let dealerUser = await prisma.dealerUser.findFirst({ where: { dealer_id: dealer.id } });
        if (!dealerUser) {
          dealerUser = await prisma.dealerUser.create({
            data: { phone: gPhone, name: googleUser.name, email: googleUser.email ?? null, role: 'admin', dealer_id: dealer.id, is_active: true },
          });
        }
        const { resolvePermissions } = await import('../lib/permissions.js');
        type JwtUser = { dealer_user_id: string; dealer_id: string | null; role: 'owner' | 'admin' | 'user'; phone: string; permissions: Record<string, boolean> };
        const jwtPayload: JwtUser = { dealer_user_id: dealerUser.id, dealer_id: dealer.id, role: 'admin', phone: gPhone, permissions: resolvePermissions(dealerUser.role) };
        jwtToken  = fastify.jwt.sign(jwtPayload, { expiresIn: '30d' });
        jwtRefresh = fastify.jwt.sign(jwtPayload, { expiresIn: '90d' });
      }

      if (!dealerId) return reply.redirect(accountsError('Session expired. Please try again.', 'gmb'));

      if (account) {
        await prisma.platformConnection.upsert({
          where: { dealer_id_platform: { dealer_id: dealerId, platform: 'gmb' } },
          create: { dealer_id: dealerId, platform: 'gmb', account_type: 'business', platform_account_id: locationName, platform_account_name: displayName, access_token, refresh_token: refresh_token ?? null, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
          update: { platform_account_id: locationName, platform_account_name: displayName, access_token, ...(refresh_token ? { refresh_token } : {}), token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
        });
      }

      if (stateData.signin && jwtToken) {
        return reply.redirect(
          `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(jwtToken)}&refresh=${encodeURIComponent(jwtRefresh ?? '')}&platform=gmb&page_name=${encodeURIComponent(displayName)}`
        );
      }
      return reply.redirect(accountsSuccess('gmb', displayName));

    } catch (err) {
      fastify.log.error(err, 'Google OAuth callback failed');
      return reply.redirect(accountsError('Google connection failed', 'gmb'));
    }
  });

  // ── GET /v1/platforms/callback/youtube ────────────────────────────────────
  fastify.get('/callback/youtube', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'YouTube login cancelled', 'youtube'));

    let stateData: { dealer_id: string | null };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'youtube')); }

    const dealer_id = stateData.dealer_id;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'youtube'));

    try {
      const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in: number }>(
        'https://oauth2.googleapis.com/token',
        { code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: YOUTUBE_CALLBACK_URI, grant_type: 'authorization_code' },
      );
      const { access_token, refresh_token, expires_in } = tokenRes.data;

      const channelRes = await axios.get<{ items?: Array<{ id: string; snippet: { title: string } }> }>(
        'https://www.googleapis.com/youtube/v3/channels',
        { params: { part: 'snippet', mine: true }, headers: { Authorization: `Bearer ${access_token}` } },
      ).catch(() => ({ data: { items: [] } }));
      const channel     = channelRes.data.items?.[0];
      const channelId   = channel?.id ?? `yt_${Date.now()}`;
      const channelName = channel?.snippet?.title ?? 'YouTube Channel';

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'youtube' } },
        create: { dealer_id, platform: 'youtube', account_type: 'channel', platform_account_id: channelId, platform_account_name: channelName, access_token, refresh_token: refresh_token ?? null, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
        update: { platform_account_id: channelId, platform_account_name: channelName, access_token, ...(refresh_token ? { refresh_token } : {}), token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
      });
      return reply.redirect(accountsSuccess('youtube', channelName));
    } catch (err) {
      fastify.log.error(err, 'YouTube OAuth callback failed');
      return reply.redirect(accountsError('YouTube connection failed', 'youtube'));
    }
  });

  // ── GET /v1/platforms/callback/linkedin ───────────────────────────────────
  fastify.get('/callback/linkedin', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'LinkedIn login cancelled', 'linkedin'));

    let stateData: { dealer_id: string | null };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'linkedin')); }

    const dealer_id = stateData.dealer_id;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'linkedin'));

    try {
      const tokenRes = await axios.post<{ access_token: string; expires_in: number }>(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: LINKEDIN_CALLBACK_URI, client_id: LINKEDIN_CLIENT_ID, client_secret: LINKEDIN_CLIENT_SECRET }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token, expires_in } = tokenRes.data;

      const profileRes = await axios.get<{ id: string; localizedFirstName: string; localizedLastName: string }>(
        'https://api.linkedin.com/v2/me',
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      const profileId   = profileRes.data.id;
      const profileName = `${profileRes.data.localizedFirstName} ${profileRes.data.localizedLastName}`.trim();

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'linkedin' } },
        create: { dealer_id, platform: 'linkedin', account_type: 'profile', platform_account_id: profileId, platform_account_name: profileName, access_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
        update: { platform_account_id: profileId, platform_account_name: profileName, access_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
      });
      return reply.redirect(accountsSuccess('linkedin', profileName));
    } catch (err) {
      fastify.log.error(err, 'LinkedIn OAuth callback failed');
      return reply.redirect(accountsError('LinkedIn connection failed', 'linkedin'));
    }
  });

  // ── GET /v1/platforms/callback/twitter (OAuth 2.0 + PKCE) ────────────────
  fastify.get('/callback/twitter', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'X login cancelled', 'twitter'));

    const pkceEntry = pkceStore.get(state);
    if (!pkceEntry) return reply.redirect(accountsError('State expired. Please try connecting again.', 'twitter'));
    pkceStore.delete(state);

    const { codeVerifier, dealer_id } = pkceEntry;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'twitter'));

    try {
      const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in?: number }>(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: TWITTER_CALLBACK_URI, client_id: TWITTER_CLIENT_ID, code_verifier: codeVerifier }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token, refresh_token, expires_in } = tokenRes.data;

      const userRes = await axios.get<{ data: { id: string; name: string; username: string } }>(
        'https://api.twitter.com/2/users/me',
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      const twitterId   = userRes.data.data.id;
      const displayName = `@${userRes.data.data.username}`;

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'twitter' } },
        create: { dealer_id, platform: 'twitter', account_type: 'profile', platform_account_id: twitterId, platform_account_name: displayName, access_token, refresh_token: refresh_token ?? null, token_expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : null, is_connected: true },
        update: { platform_account_id: twitterId, platform_account_name: displayName, access_token, ...(refresh_token ? { refresh_token } : {}), token_expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : null, is_connected: true },
      });
      return reply.redirect(accountsSuccess('twitter', displayName));
    } catch (err) {
      fastify.log.error(err, 'Twitter/X OAuth callback failed');
      return reply.redirect(accountsError('X connection failed', 'twitter'));
    }
  });

  // ── GET /v1/platforms/callback/tiktok ────────────────────────────────────
  fastify.get('/callback/tiktok', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'TikTok login cancelled', 'tiktok'));

    let stateData: { dealer_id: string | null };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'tiktok')); }

    const dealer_id = stateData.dealer_id;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'tiktok'));

    try {
      const tokenRes = await axios.post<{
        data: { access_token: string; refresh_token: string; open_id: string; expires_in: number };
        error: { code: string; message: string };
      }>(
        'https://open.tiktokapis.com/v2/oauth/token/',
        new URLSearchParams({ client_key: TIKTOK_APP_KEY, client_secret: TIKTOK_APP_SECRET, code, grant_type: 'authorization_code', redirect_uri: TIKTOK_CALLBACK_URI }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token, refresh_token, open_id, expires_in } = tokenRes.data.data;

      const userRes = await axios.get<{ data: { user: { open_id: string; display_name: string } } }>(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
        { headers: { Authorization: `Bearer ${access_token}` } },
      ).catch(() => ({ data: { data: { user: { open_id, display_name: `TikTok:${open_id}` } } } }));
      const displayName = userRes.data.data.user.display_name;

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'tiktok' } },
        create: { dealer_id, platform: 'tiktok', account_type: 'business', platform_account_id: open_id, platform_account_name: displayName, access_token, refresh_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
        update: { platform_account_id: open_id, platform_account_name: displayName, access_token, refresh_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
      });
      return reply.redirect(accountsSuccess('tiktok', displayName));
    } catch (err) {
      fastify.log.error(err, 'TikTok OAuth callback failed');
      return reply.redirect(accountsError('TikTok connection failed', 'tiktok'));
    }
  });

  // ── GET /v1/platforms/callback/pinterest ─────────────────────────────────
  fastify.get('/callback/pinterest', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'Pinterest login cancelled', 'pinterest'));

    let stateData: { dealer_id: string | null };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'pinterest')); }

    const dealer_id = stateData.dealer_id;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'pinterest'));

    try {
      const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in?: number }>(
        'https://api.pinterest.com/v5/oauth/token',
        new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: PINTEREST_CALLBACK_URI }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64')}`,
          },
        },
      );
      const { access_token, refresh_token, expires_in } = tokenRes.data;

      const userRes = await axios.get<{ username: string }>(
        'https://api.pinterest.com/v5/user_account',
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      const username = userRes.data.username ?? 'Pinterest User';

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'pinterest' } },
        create: { dealer_id, platform: 'pinterest', account_type: 'profile', platform_account_id: username, platform_account_name: username, access_token, refresh_token: refresh_token ?? null, token_expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : null, is_connected: true },
        update: { platform_account_id: username, platform_account_name: username, access_token, ...(refresh_token ? { refresh_token } : {}), token_expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : null, is_connected: true },
      });
      return reply.redirect(accountsSuccess('pinterest', username));
    } catch (err) {
      fastify.log.error(err, 'Pinterest OAuth callback failed');
      return reply.redirect(accountsError('Pinterest connection failed', 'pinterest'));
    }
  });

  // ── GET /v1/platforms/callback/threads ───────────────────────────────────
  fastify.get('/callback/threads', async (request, reply) => {
    const { code, state, error: oauthError } = request.query as { code?: string; state?: string; error?: string };
    const THREADS_APP_ID     = process.env['THREADS_APP_ID']     ?? META_APP_ID;
    const THREADS_APP_SECRET = process.env['THREADS_APP_SECRET'] ?? META_APP_SECRET;
    if (oauthError || !code || !state) return reply.redirect(accountsError(oauthError ?? 'Threads login cancelled', 'threads'));

    let stateData: { dealer_id: string | null };
    try { stateData = decodeState(state); }
    catch { return reply.redirect(accountsError('Invalid state', 'threads')); }

    const dealer_id = stateData.dealer_id;
    if (!dealer_id) return reply.redirect(accountsError('Session expired', 'threads'));

    try {
      // Short-lived token
      const tokenRes = await axios.post<{ access_token: string; user_id: number }>(
        'https://graph.threads.net/oauth/access_token',
        new URLSearchParams({ client_id: THREADS_APP_ID, client_secret: THREADS_APP_SECRET, grant_type: 'authorization_code', redirect_uri: THREADS_CALLBACK_URI, code }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token: shortToken, user_id } = tokenRes.data;

      // Long-lived token
      const longTokenRes = await axios.get<{ access_token: string; expires_in: number }>(
        'https://graph.threads.net/access_token',
        { params: { grant_type: 'th_exchange_token', client_secret: THREADS_APP_SECRET, access_token: shortToken } },
      );
      const { access_token, expires_in } = longTokenRes.data;

      const userRes = await axios.get<{ id: string; username: string }>(
        `https://graph.threads.net/v1.0/${user_id}`,
        { params: { fields: 'id,username', access_token } },
      );
      const username = `@${userRes.data.username}`;

      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id, platform: 'threads' } },
        create: { dealer_id, platform: 'threads', account_type: 'profile', platform_account_id: String(user_id), platform_account_name: username, access_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
        update: { platform_account_id: String(user_id), platform_account_name: username, access_token, token_expires_at: new Date(Date.now() + expires_in * 1000), is_connected: true },
      });
      return reply.redirect(accountsSuccess('threads', username));
    } catch (err) {
      fastify.log.error(err, 'Threads OAuth callback failed');
      return reply.redirect(accountsError('Threads connection failed', 'threads'));
    }
  });

  // ── DELETE /v1/platforms/:platform — disconnect ───────────────────────────
  fastify.delete('/:platform', { preHandler: [fastify.authenticate] }, async (request) => {
    const dealer_id = request.user.dealer_id!;
    const { platform } = request.params as { platform: string };
    await prisma.platformConnection.updateMany({
      where: { dealer_id, platform },
      data: { is_connected: false },
    });
    return { success: true, message: `${platform} disconnected` };
  });
}
