import type { FastifyInstance } from "fastify"
import { prisma } from "../db/prisma.js"
import { resolvePermissions, ROLES } from "../lib/permissions.js"
import type { Role, JwtUser } from "../lib/permissions.js"
import { setOtp, getOtp, deleteOtp } from "../lib/otpStore.js"
import { SEED_PAGES, scrapePublicPage, extractPatterns } from "../services/socialScraper.js"
import { saveAccount } from "../services/platformConnections.js"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOtp(phone: string, otp: string): Promise<void> {
  const provider = process.env["OTP_PROVIDER"]

  if (!provider || process.env["NODE_ENV"] === "development") {
    // Dev mode: log OTP and accept '1234' as universal code
    console.log(`[OTP] ${phone} → ${otp} (dev mode, use 1234 to bypass)`)
    return
  }

  if (provider === "twilio") {
    const { default: axios } = await import("axios")
    const sid = process.env["TWILIO_ACCOUNT_SID"]
    const token = process.env["TWILIO_AUTH_TOKEN"]
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      new URLSearchParams({
        Body: `Your Cardeko Social AI OTP is ${otp}. Valid for 10 minutes.`,
        From: process.env["TWILIO_PHONE_NUMBER"] ?? "",
        To: phone,
      }),
      { auth: { username: sid ?? "", password: token ?? "" } },
    )
    return
  }

  if (provider === "msg91") {
    const { default: axios } = await import("axios")
    await axios.post("https://api.msg91.com/api/v5/otp", {
      template_id: process.env["MSG91_TEMPLATE_ID"],
      mobile: phone.replace("+", ""),
      authkey: process.env["MSG91_AUTH_KEY"],
      otp,
    })
  }
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /v1/auth/otp/send
  fastify.post("/otp/send", async (request, reply) => {
    const { phone } = request.body as { phone?: string }
    if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ""))) {
      return reply.code(400).send({
        error: {
          code: "INVALID_INPUT",
          message: "Valid phone number is required",
        },
      })
    }

    const otp = generateOtp()
    await setOtp(phone, otp)

    try {
      await sendOtp(phone, otp)
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({
        error: { code: "OTP_SEND_FAILED", message: "Failed to send OTP" },
      })
    }

    return { success: true, message: `OTP sent to ${phone}` }
  })

  // POST /v1/auth/otp/verify
  fastify.post("/otp/verify", async (request, reply) => {
    const { phone, otp } = request.body as { phone?: string; otp?: string }
    if (!phone || !otp) {
      return reply.code(400).send({
        error: {
          code: "INVALID_INPUT",
          message: "phone and otp are required",
        },
      })
    }

    // Dev bypass
    const isDev = process.env["NODE_ENV"] === "development"
    const storedOtp = await getOtp(phone)
    const valid = (isDev && otp === "1234") || (storedOtp && storedOtp === otp)

    if (!valid) {
      return reply.code(400).send({
        error: { code: "INVALID_OTP", message: "Incorrect or expired OTP" },
      })
    }

    await deleteOtp(phone)

    const ownerPhone = process.env["OWNER_PHONE"]

    // ── Owner account ────────────────────────────────────────────────────────
    if (ownerPhone && phone === ownerPhone) {
      const ownerUser = await prisma.dealerUser.upsert({
        where: { phone },
        create: {
          phone,
          name: "Product Owner",
          role: ROLES.OWNER,
          dealer_id: null,
          is_active: true,
        },
        update: {},
      })
      const permissions = resolvePermissions(ownerUser.role)
      const payload: JwtUser = {
        dealer_user_id: ownerUser.id,
        dealer_id: null,
        role: ownerUser.role as Role,
        phone,
        permissions,
      }
      const token = fastify.jwt.sign(payload, {
        expiresIn: process.env["JWT_EXPIRES_IN"] ?? "15m",
      })
      const refreshToken = fastify.jwt.sign(payload, {
        expiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d",
      })
      const crypto = await import("crypto")
      await prisma.userSession.create({
        data: {
          dealer_user_id: ownerUser.id,
          token_hash: crypto.createHash("sha256").update(token).digest("hex"),
          ip_address: request.ip,
          user_agent: request.headers["user-agent"] ?? null,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        },
      })
      return {
        token,
        refreshToken,
        user: {
          id: ownerUser.id,
          name: ownerUser.name,
          role: ownerUser.role,
          dealer_id: null,
          permissions,
          onboarding_completed: true,
        },
      }
    }

    // ── Find existing DealerUser ─────────────────────────────────────────────
    const existingUser = await prisma.dealerUser.findUnique({
      where: { phone },
    })

    if (existingUser && !existingUser.is_active) {
      return reply.code(403).send({
        error: {
          code: "ACCOUNT_INACTIVE",
          message: "Your account is inactive. Ask your admin to re-enable it.",
        },
      })
    }

    let dealerUser = existingUser
    let dealer = existingUser?.dealer_id
      ? await prisma.dealer.findUnique({
          where: { id: existingUser.dealer_id },
        })
      : null

    // ── First-time registration: create Dealer org + admin user ──────────────
    if (!dealerUser) {
      dealer = await prisma.dealer.upsert({
        where: { phone },
        create: { phone, name: "New Dealer", city: "", onboarding_step: 1 },
        update: {},
      })
      dealerUser = await prisma.dealerUser.create({
        data: {
          phone,
          name: "Admin",
          role: ROLES.ADMIN,
          dealer_id: dealer.id,
          is_active: true,
        },
      })
    }

    const permissions = resolvePermissions(
      dealerUser.role,
      dealerUser.permissions as Record<string, boolean> | null,
    )
    const payload: JwtUser = {
      dealer_user_id: dealerUser.id,
      dealer_id: dealerUser.dealer_id,
      role: dealerUser.role as Role,
      phone,
      permissions,
    }
    const token = fastify.jwt.sign(payload, {
      expiresIn: process.env["JWT_EXPIRES_IN"] ?? "15m",
    })
    const refreshToken = fastify.jwt.sign(payload, {
      expiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d",
    })

    // Store session
    const crypto = await import("crypto")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    await prisma.userSession.create({
      data: {
        dealer_user_id: dealerUser.id,
        token_hash: tokenHash,
        ip_address: request.ip,
        user_agent: request.headers["user-agent"] ?? null,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    // Log login
    if (dealerUser.dealer_id) {
      await prisma.activityLog.create({
        data: {
          dealer_id: dealerUser.dealer_id,
          dealer_user_id: dealerUser.id,
          action: "auth.login",
          entity_type: "dealer_user",
          entity_id: dealerUser.id,
          ip_address: request.ip,
          user_agent: request.headers["user-agent"] ?? null,
        },
      })
    }

    return {
      token,
      refreshToken,
      user: {
        id: dealerUser.id,
        name: dealerUser.name,
        role: dealerUser.role,
        dealer_id: dealerUser.dealer_id,
        permissions,
        onboarding_completed: dealer?.onboarding_completed ?? false,
        onboarding_step: dealer?.onboarding_step ?? 1,
      },
    }
  })

  // POST /v1/auth/demo — issues a JWT for a sandboxed demo dealer, no OTP required
  fastify.post("/demo", async (_request, reply) => {
    const demoPhone = "+0000000001"
    try {
      // Track whether this is the very first creation so we can seed patterns
      const existing = await prisma.dealer.findUnique({ where: { phone: demoPhone } })

      const demoDealer = await prisma.dealer.upsert({
        where: { phone: demoPhone },
        create: {
          phone: demoPhone,
          name: "Demo Dealership",
          city: "Mumbai",
          brands: ["Maruti Suzuki", "Hyundai"],
          contact_phone: "+91-9999999999",
          whatsapp_number: "+91-9999999999",
          primary_color: "#f97316",
          onboarding_step: 4,
          onboarding_completed: true,
        },
        update: {},
      })

      // On first boot: seed inspiration patterns in the background (fire & forget)
      if (!existing) {
        const dealerId = demoDealer.id
        void (async () => {
          // Scrape a focused subset (3 pages) to keep startup fast
          const seedSubset = SEED_PAGES.slice(0, 3)
          for (const page of seedSubset) {
            try {
              const posts = await scrapePublicPage(page.url)
              const patterns = extractPatterns(posts)
              fastify.log.info(`[Demo seed] ${page.name}: ${posts.length} posts, types: ${patterns.detected_post_types.join(', ')}`)
              if (posts.length > 0) {
                await prisma.inspirationHandle.upsert({
                  where: { dealer_id_handle_url: { dealer_id: dealerId, handle_url: page.url } },
                  create: {
                    dealer_id: dealerId,
                    handle_url: page.url,
                    platform: page.platform,
                    handle_name: `${page.brand} — ${page.state}`,
                    posts_cache: posts,
                    last_scraped_at: new Date(),
                  },
                  update: { posts_cache: posts, last_scraped_at: new Date() },
                })
              }
            } catch (e) {
              fastify.log.warn(`[Demo seed] Failed to scrape ${page.name}: ${String(e)}`)
            }
          }
        })()
      }

      const demoUser = await prisma.dealerUser.upsert({
        where: { phone: demoPhone },
        create: {
          phone: demoPhone,
          name: "Demo User",
          role: ROLES.OWNER,
          dealer_id: demoDealer.id,
          is_active: true,
        },
        update: {},
      })

      const permissions = resolvePermissions(ROLES.OWNER)
      const payload: JwtUser = {
        dealer_user_id: demoUser.id,
        dealer_id: demoDealer.id,
        role: ROLES.OWNER as Role,
        phone: demoPhone,
        permissions,
      }
      const token = fastify.jwt.sign(payload, { expiresIn: "8h" })
      const refreshToken = fastify.jwt.sign(payload, {
        expiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d",
      })

      return {
        token,
        refreshToken,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          role: demoUser.role,
          dealer_id: demoDealer.id,
          permissions,
          onboarding_completed: true,
          onboarding_step: 4,
        },
      }
    } catch (err) {
      fastify.log.error(err, "Demo login failed")
      return reply.code(503).send({
        error: { code: "DEMO_UNAVAILABLE", message: "Demo service temporarily unavailable" },
      })
    }
  })

  // POST /v1/auth/refresh
  fastify.post("/refresh", async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string }
    if (!refreshToken) {
      return reply.code(400).send({
        error: { code: "MISSING_TOKEN", message: "refreshToken is required" },
      })
    }

    try {
      const payload = fastify.jwt.verify<JwtUser>(refreshToken)
      const token = fastify.jwt.sign(
        {
          dealer_user_id: payload.dealer_user_id,
          dealer_id: payload.dealer_id,
          role: payload.role,
          phone: payload.phone,
          permissions: payload.permissions,
        },
        { expiresIn: process.env["JWT_EXPIRES_IN"] ?? "15m" },
      )
      return { token }
    } catch {
      return reply.code(401).send({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid or expired refresh token",
        },
      })
    }
  })

  // ─── Facebook OAuth ────────────────────────────────────────────────────────
  
  const FB_API_VERSION = 'v18.0';
  const FB_SCOPES = ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'].join(',');

  fastify.get('/facebook', async (_request, reply) => {
    const META_APP_ID = process.env['META_APP_ID'];
    const META_REDIRECT_URI = process.env['META_REDIRECT_URI'];

    if (!META_APP_ID || !META_REDIRECT_URI) {
      fastify.log.error('[FB OAuth] Missing META_APP_ID or META_REDIRECT_URI');
      return reply.code(500).send({ error: 'Facebook OAuth not configured on server' });
    }

    const authUrl = new URL(`https://www.facebook.com/${FB_API_VERSION}/dialog/oauth`);
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
    authUrl.searchParams.set('scope', FB_SCOPES);
    authUrl.searchParams.set('response_type', 'code');

    return reply.redirect(authUrl.toString());
  });

  fastify.get('/facebook/callback', async (request, reply) => {
    const { code, error: fbError } = request.query as { code?: string; error?: string };
    const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://social-genie-web.vercel.app';

    if (fbError || !code) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=${encodeURIComponent(fbError ?? 'no_code')}`);
    }

    const META_APP_ID = process.env['META_APP_ID'];
    const META_APP_SECRET = process.env['META_APP_SECRET'];
    const META_REDIRECT_URI = process.env['META_REDIRECT_URI'];

    if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=server_config`);
    }

    try {
      // Exchange code
      const tokenUrl = new URL(`https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token`);
      tokenUrl.searchParams.set('client_id', META_APP_ID);
      tokenUrl.searchParams.set('client_secret', META_APP_SECRET);
      tokenUrl.searchParams.set('redirect_uri', META_REDIRECT_URI);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      const tokenData = await tokenRes.json() as any;
      const userAccessToken = tokenData.access_token;

      // Fetch pages
      const pagesUrl = `https://graph.facebook.com/${FB_API_VERSION}/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token`;
      const pagesRes = await fetch(pagesUrl);
      const pagesData = await pagesRes.json() as any;
      const pages = pagesData.data ?? [];

      let fbCount = 0;
      let igCount = 0;

      for (const page of pages) {
        await saveAccount({
          userId: 'test-dealer',
          platform: 'facebook',
          accountId: page.id,
          accountName: page.name,
          accessToken: page.access_token,
        });
        fbCount++;

        // Check IG
        const igUrl = `https://graph.facebook.com/${FB_API_VERSION}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
        const igRes = await fetch(igUrl);
        const igData = await igRes.json() as any;

        if (igData.instagram_business_account?.id) {
          const igId = igData.instagram_business_account.id;
          const igDetailsRes = await fetch(`https://graph.facebook.com/${FB_API_VERSION}/${igId}?fields=id,username&access_token=${page.access_token}`);
          const igDetails = await igDetailsRes.json() as any;

          await saveAccount({
            userId: 'test-dealer',
            platform: 'instagram',
            accountId: igDetails.id,
            accountName: igDetails.username ?? `IG-${igDetails.id}`,
            accessToken: page.access_token,
          });
          igCount++;
        }
      }

      return reply.redirect(`${FRONTEND_URL}/accounts?success=true&fb=${fbCount}&ig=${igCount}`);
    } catch (err) {
      fastify.log.error(err, '[FB OAuth] Callback failed');
      return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange_failed`);
    }
  });

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  fastify.get('/google', async (_request, reply) => {
    const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
    const GOOGLE_REDIRECT_URI = process.env['GOOGLE_REDIRECT_URI'];

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      return reply.code(500).send({ error: 'Google OAuth not configured on server' });
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('scope', GOOGLE_SCOPES);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return reply.redirect(authUrl.toString());
  });

  fastify.get('/google/callback', async (request, reply) => {
    const { code, error: gError } = request.query as { code?: string; error?: string };
    const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'https://social-genie-web.vercel.app';

    if (gError || !code) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=${encodeURIComponent(gError ?? 'no_code')}`);
    }

    const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
    const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
    const GOOGLE_REDIRECT_URI = process.env['GOOGLE_REDIRECT_URI'];

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      return reply.redirect(`${FRONTEND_URL}/accounts?error=server_config`);
    }

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

      const tokenData = await tokenRes.json() as any;
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;

      // Fetch accounts
      const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const accountsData = await accountsRes.json() as any;
      const accounts = accountsData.accounts ?? [];

      let savedCount = 0;
      for (const account of accounts) {
        const accountId = account.name.replace('accounts/', '');
        
        // Fetch locations
        const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const locData = await locationsRes.json() as any;
        const locations = locData.locations ?? [];

        for (const loc of locations) {
          const locId = loc.name.replace('locations/', '');
          await saveAccount({
            userId: 'test-dealer',
            platform: 'google',
            accountId: `${accountId}/${locId}`,
            accountName: loc.title || account.accountName,
            accessToken,
            refreshToken,
          });
          savedCount++;
        }

        if (locations.length === 0) {
          await saveAccount({
            userId: 'test-dealer',
            platform: 'google',
            accountId,
            accountName: account.accountName || `Google Business ${accountId}`,
            accessToken,
            refreshToken,
          });
          savedCount++;
        }
      }

      return reply.redirect(`${FRONTEND_URL}/accounts?success=true&google=${savedCount}`);
    } catch (err) {
      fastify.log.error(err, '[Google OAuth] Callback failed');
      return reply.redirect(`${FRONTEND_URL}/accounts?error=token_exchange_failed`);
    }
  });
}
