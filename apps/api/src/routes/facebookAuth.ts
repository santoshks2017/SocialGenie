import type { FastifyInstance } from 'fastify';
import { saveAccount } from '../services/platformConnections.js';

const META_APP_ID = process.env['META_APP_ID'] ?? '';
const META_APP_SECRET = process.env['META_APP_SECRET'] ?? '';
const META_REDIRECT_URI = process.env['META_REDIRECT_URI'] ?? '';
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://social-genie-web.vercel.app';

const FB_API_VERSION = 'v18.0';

const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
].join(',');

interface FBTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface FBPage {
  id: string;
  name: string;
  access_token: string;
}

interface FBPagesResponse {
  data: FBPage[];
}

export default async function facebookAuthRoutes(fastify: FastifyInstance) {

  // GET /v1/auth/facebook — redirect to Facebook OAuth
  fastify.get('/facebook', async (_request, reply) => {
    if (!META_APP_ID || !META_REDIRECT_URI) {
      return reply.code(500).send({ error: 'META_APP_ID or META_REDIRECT_URI not configured' });
    }

    fastify.log.info('[FB OAuth] Initiating Facebook OAuth flow');

    const authUrl = new URL(`https://www.facebook.com/${FB_API_VERSION}/dialog/oauth`);
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('response_type', 'code');

    return reply.redirect(authUrl.toString());
  });

  // GET /v1/auth/facebook/callback — exchange code, fetch pages + IG, redirect to frontend
  fastify.get('/facebook/callback', async (request, reply) => {
    const { code, error: fbError } = request.query as { code?: string; error?: string };

    if (fbError || !code) {
      fastify.log.warn(`[FB OAuth] User denied or error: ${fbError ?? 'no code'}`);
      return reply.redirect(`${FRONTEND_URL}/accounts?error=${encodeURIComponent(fbError ?? 'no_code')}`);
    }

    if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=server_config`);
    }

    // Step 1: Exchange code for user access token
    let userAccessToken: string;
    let expiresIn: number | undefined;
    try {
      const tokenUrl = new URL(`https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token`);
      tokenUrl.searchParams.set('client_id', META_APP_ID);
      tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
      tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        fastify.log.error(`[FB OAuth] Token exchange failed: ${errBody}`);
        return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange`);
      }

      const tokenData = await tokenRes.json() as FBTokenResponse;
      userAccessToken = tokenData.access_token;
      expiresIn = tokenData.expires_in;
      fastify.log.info('[FB OAuth] Access token received successfully');
    } catch (err) {
      fastify.log.error(`[FB OAuth] Token exchange error: ${String(err)}`);
      return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange`);
    }

    // Step 2: Fetch user's pages
    let pages: FBPage[];
    try {
      const pagesUrl = `https://graph.facebook.com/${FB_API_VERSION}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token`;
      const pagesRes = await fetch(pagesUrl);
      if (!pagesRes.ok) {
        const errBody = await pagesRes.text();
        fastify.log.error(`[FB OAuth] Pages fetch failed: ${errBody}`);
        return reply.redirect(`${FRONTEND_URL}/accounts?error=pages_fetch`);
      }

      const pagesData = await pagesRes.json() as FBPagesResponse;
      pages = pagesData.data ?? [];
      fastify.log.info(`[FB OAuth] Fetched ${pages.length} page(s)`);
    } catch (err) {
      fastify.log.error(`[FB OAuth] Pages fetch error: ${String(err)}`);
      return reply.redirect(`${FRONTEND_URL}/accounts?error=pages_fetch`);
    }

    if (pages.length === 0) {
      fastify.log.warn('[FB OAuth] No Facebook pages found for this user');
      return reply.redirect(`${FRONTEND_URL}/accounts?warning=no_pages`);
    }

    // Step 3: Save each page + auto-detect linked Instagram accounts
    const tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
    let fbCount = 0;
    let igCount = 0;

    for (const page of pages) {
      // Save Facebook page
      try {
        await saveAccount({
          userId: 'test-dealer',
          platform: 'facebook',
          accountId: page.id,
          accountName: page.name,
          accessToken: page.access_token,
          tokenExpiry,
        });
        fbCount++;
        fastify.log.info(`[FB OAuth] Saved page: ${page.name} (${page.id})`);
      } catch (err) {
        fastify.log.error(`[FB OAuth] Failed to save page ${page.id}: ${String(err)}`);
      }

      // Step 4: Check for linked Instagram Business account
      try {
        const igUrl = `https://graph.facebook.com/${FB_API_VERSION}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
        const igRes = await fetch(igUrl);

        if (igRes.ok) {
          const igData = await igRes.json() as { instagram_business_account?: { id: string } };

          if (igData.instagram_business_account?.id) {
            const igAccountId = igData.instagram_business_account.id;

            const igDetailsUrl = `https://graph.facebook.com/${FB_API_VERSION}/${igAccountId}?fields=id,username&access_token=${page.access_token}`;
            const igDetailsRes = await fetch(igDetailsUrl);

            if (igDetailsRes.ok) {
              const igDetails = await igDetailsRes.json() as { id: string; username?: string };

              await saveAccount({
                userId: 'test-dealer',
                platform: 'instagram',
                accountId: igDetails.id,
                accountName: igDetails.username ?? `IG-${igDetails.id}`,
                accessToken: page.access_token,
                tokenExpiry,
              });
              igCount++;
              fastify.log.info(`[FB OAuth] Saved linked Instagram: @${igDetails.username ?? igDetails.id}`);
            }
          }
        }
      } catch (err) {
        fastify.log.warn(`[FB OAuth] Instagram check failed for page ${page.id}: ${String(err)}`);
      }
    }

    fastify.log.info(`[FB OAuth] Complete — ${fbCount} FB page(s), ${igCount} IG account(s)`);
    return reply.redirect(`${FRONTEND_URL}/accounts?success=true&fb=${fbCount}&ig=${igCount}`);
  });
}
