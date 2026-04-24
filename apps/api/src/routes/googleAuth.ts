import type { FastifyInstance } from 'fastify';
import { saveAccount } from '../services/platformConnections.js';

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'] ?? '';
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
const GOOGLE_REDIRECT_URI = process.env['GOOGLE_REDIRECT_URI'] ?? '';
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://social-genie-web.vercel.app';

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

interface GoogleAccount {
  name: string;
  accountName: string;
  type: string;
}

interface GoogleAccountsResponse {
  accounts?: GoogleAccount[];
}

interface GoogleLocation {
  name: string;
  title: string;
  storefrontAddress?: { locality?: string };
}

interface GoogleLocationsResponse {
  locations?: GoogleLocation[];
}

export default async function googleAuthRoutes(fastify: FastifyInstance) {

  // GET /v1/auth/google — redirect to Google OAuth consent
  fastify.get('/google', async (_request, reply) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      return reply.code(500).send({ error: 'GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI not configured' });
    }

    fastify.log.info('[Google OAuth] Initiating Google OAuth flow');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return reply.redirect(authUrl.toString());
  });

  // GET /v1/auth/google/callback — exchange code, fetch business profiles, redirect to frontend
  fastify.get('/google/callback', async (request, reply) => {
    const { code, error: gError } = request.query as { code?: string; error?: string };

    if (gError || !code) {
      fastify.log.warn(`[Google OAuth] User denied or error: ${gError ?? 'no code'}`);
      return reply.redirect(`${FRONTEND_URL}/accounts?error=${encodeURIComponent(gError ?? 'no_code')}`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=server_config`);
    }

    // Step 1: Exchange code for tokens
    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresIn: number;
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        fastify.log.error(`[Google OAuth] Token exchange failed: ${errBody}`);
        return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange`);
      }

      const tokenData = await tokenRes.json() as GoogleTokenResponse;
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      expiresIn = tokenData.expires_in;
      fastify.log.info('[Google OAuth] Access token received successfully');
    } catch (err) {
      fastify.log.error(`[Google OAuth] Token exchange error: ${String(err)}`);
      return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange`);
    }

    // Step 2: Fetch Google Business Profile accounts
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    let savedCount = 0;

    try {
      const accountsRes = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json() as GoogleAccountsResponse;
        const accounts = accountsData.accounts ?? [];
        fastify.log.info(`[Google OAuth] Fetched ${accounts.length} business account(s)`);

        for (const account of accounts) {
          const accountId = account.name.replace('accounts/', '');

          // Step 3: Fetch locations for each account
          try {
            const locationsRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );

            if (locationsRes.ok) {
              const locData = await locationsRes.json() as GoogleLocationsResponse;
              const locations = locData.locations ?? [];
              fastify.log.info(`[Google OAuth] Found ${locations.length} location(s) for ${account.accountName}`);

              for (const loc of locations) {
                const locId = loc.name.replace('locations/', '');
                await saveAccount({
                  userId: 'test-dealer',
                  platform: 'google',
                  accountId: `${accountId}/${locId}`,
                  accountName: loc.title || account.accountName,
                  accessToken,
                  refreshToken,
                  tokenExpiry,
                });
                savedCount++;
                fastify.log.info(`[Google OAuth] Saved location: ${loc.title}`);
              }
            }
          } catch (err) {
            fastify.log.warn(`[Google OAuth] Failed to fetch locations for ${account.name}: ${String(err)}`);
          }

          // If no locations found, save the account itself
          if (savedCount === 0) {
            await saveAccount({
              userId: 'test-dealer',
              platform: 'google',
              accountId,
              accountName: account.accountName || `Google Business ${accountId}`,
              accessToken,
              refreshToken,
              tokenExpiry,
            });
            savedCount++;
            fastify.log.info(`[Google OAuth] Saved account: ${account.accountName}`);
          }
        }
      } else {
        const errBody = await accountsRes.text();
        fastify.log.warn(`[Google OAuth] Business accounts fetch failed (${accountsRes.status}): ${errBody}`);
      }
    } catch (err) {
      fastify.log.error(`[Google OAuth] Business accounts fetch error: ${String(err)}`);
    }

    fastify.log.info(`[Google OAuth] Complete — ${savedCount} profile(s) saved`);
    return reply.redirect(`${FRONTEND_URL}/accounts?success=true&google=${savedCount}`);
  });
}
