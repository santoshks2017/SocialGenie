import type { FastifyInstance } from 'fastify';
import { saveAccount } from '../services/platformConnections.js';

const META_APP_ID = process.env['META_APP_ID'] ?? '';
const META_APP_SECRET = process.env['META_APP_SECRET'] ?? '';
const META_REDIRECT_URI = process.env['META_REDIRECT_URI'] ?? '';

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

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', 'socialgenie'); // simple CSRF placeholder

    return reply.redirect(authUrl.toString());
  });

  // GET /v1/auth/facebook/callback — exchange code for token, fetch pages, save
  fastify.get('/facebook/callback', async (request, reply) => {
    const { code, error: fbError } = request.query as { code?: string; error?: string };

    if (fbError || !code) {
      fastify.log.warn(`[FB OAuth] User denied or error: ${fbError ?? 'no code'}`);
      return reply.code(400).send({ error: fbError ?? 'No authorization code received' });
    }

    if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
      return reply.code(500).send({ error: 'Facebook OAuth environment variables not configured' });
    }

    // Step 1: Exchange code for user access token
    let userAccessToken: string;
    let expiresIn: number | undefined;
    try {
      const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', META_APP_ID);
      tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
      tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        fastify.log.error(`[FB OAuth] Token exchange failed: ${errBody}`);
        return reply.code(502).send({ error: 'Failed to exchange code for access token' });
      }

      const tokenData = await tokenRes.json() as FBTokenResponse;
      userAccessToken = tokenData.access_token;
      expiresIn = tokenData.expires_in;
    } catch (err) {
      fastify.log.error(`[FB OAuth] Token exchange error: ${String(err)}`);
      return reply.code(502).send({ error: 'Failed to exchange code for access token' });
    }

    // Step 2: Fetch user's pages
    let pages: FBPage[];
    try {
      const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token`;
      const pagesRes = await fetch(pagesUrl);
      if (!pagesRes.ok) {
        const errBody = await pagesRes.text();
        fastify.log.error(`[FB OAuth] Pages fetch failed: ${errBody}`);
        return reply.code(502).send({ error: 'Failed to fetch Facebook pages' });
      }

      const pagesData = await pagesRes.json() as FBPagesResponse;
      pages = pagesData.data ?? [];
    } catch (err) {
      fastify.log.error(`[FB OAuth] Pages fetch error: ${String(err)}`);
      return reply.code(502).send({ error: 'Failed to fetch Facebook pages' });
    }

    if (pages.length === 0) {
      return reply.code(200).send({ success: true, message: 'No Facebook pages found for this user', accounts: [] });
    }

    // Step 3: Save each page + auto-detect linked Instagram accounts
    const savedAccounts: unknown[] = [];
    const savedInstagramAccounts: unknown[] = [];
    const tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    for (const page of pages) {
      // Save Facebook page
      try {
        const account = await saveAccount({
          userId: 'test-dealer',
          platform: 'facebook',
          accountId: page.id,
          accountName: page.name,
          accessToken: page.access_token,
          tokenExpiry,
        });
        savedAccounts.push(account);
        fastify.log.info(`[FB OAuth] Saved page: ${page.name} (${page.id})`);
      } catch (err) {
        fastify.log.error(`[FB OAuth] Failed to save page ${page.id}: ${String(err)}`);
      }

      // Step 4: Check for linked Instagram Business account
      try {
        const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
        const igRes = await fetch(igUrl);

        if (igRes.ok) {
          const igData = await igRes.json() as { instagram_business_account?: { id: string } };

          if (igData.instagram_business_account?.id) {
            const igAccountId = igData.instagram_business_account.id;

            // Fetch Instagram account details (username, name)
            const igDetailsUrl = `https://graph.facebook.com/v21.0/${igAccountId}?fields=id,username,name&access_token=${page.access_token}`;
            const igDetailsRes = await fetch(igDetailsUrl);

            if (igDetailsRes.ok) {
              const igDetails = await igDetailsRes.json() as { id: string; username?: string; name?: string };

              const igAccount = await saveAccount({
                userId: 'test-dealer',
                platform: 'instagram',
                accountId: igDetails.id,
                accountName: igDetails.username ?? igDetails.name ?? `IG-${igDetails.id}`,
                accessToken: page.access_token, // Instagram uses the page token
                tokenExpiry,
              });
              savedInstagramAccounts.push(igAccount);
              fastify.log.info(`[FB OAuth] Saved linked Instagram: @${igDetails.username ?? igDetails.id} via page ${page.name}`);
            }
          }
        }
      } catch (err) {
        fastify.log.warn(`[FB OAuth] Instagram check failed for page ${page.id}: ${String(err)}`);
        // Non-fatal — continue with other pages
      }
    }

    return {
      success: true,
      message: `Connected ${savedAccounts.length} Facebook page(s) and ${savedInstagramAccounts.length} Instagram account(s)`,
      facebook: savedAccounts,
      instagram: savedInstagramAccounts,
    };
  });
}
