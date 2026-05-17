# Cardeko Social AI

AI-powered social media management for Indian auto dealerships. Dealers type a prompt ("Weekend offer on Brezza"), the AI generates captions + branded images, pulls live inventory prices, and publishes to Facebook, Instagram, and Google Business Profile.

## What's in this repo

```
apps/
  api/    — Fastify + Prisma + BullMQ backend (Node.js)
  web/    — React 19 + Vite + Tailwind frontend
packages/
  shared/          — shared TypeScript types
  render-engine/   — image composition (@napi-rs/canvas)
  pattern-engine/  — post pattern analysis
  template-engine/ — post template selection
  scraper/         — social page scraping (Playwright)
```

## Prerequisites

- Node.js 20+
- Docker (for local Postgres + Redis)

## Quick start

```bash
# 1. Clone and install
git clone <repo-url>
cd SocialGenie
npm install

# 2. Start local database and Redis
docker-compose up -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — at minimum set DATABASE_URL and JWT_SECRET.
# Leave OTP_PROVIDER blank to use the 1234 dev bypass.
# Set ALLOW_DEV_AUTOLOGIN="true" to skip JWT auth in local dev.

# 4. Apply database migrations
cd apps/api
npx prisma migrate dev
cd ../..

# 5. Start dev servers (both api + web)
npm run dev
```

API runs at `http://localhost:3001`, web at `http://localhost:5173`.

## Key environment variables

See `apps/api/.env.example` for the full annotated list. Critical ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon in prod, docker-compose locally) |
| `REDIS_URL` | Redis URL (Upstash in prod, docker-compose locally) |
| `JWT_SECRET` | 64-byte random hex — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NODE_ENV` | Must be `production` in any deployed env |
| `ALLOW_DEV_AUTOLOGIN` | Set to `true` only in local dev to skip JWT — **never in production** |
| `GROQ_API_KEY` | Primary LLM for caption generation (free tier) |
| `META_APP_ID` / `META_APP_SECRET` | Facebook/Instagram publishing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Business Profile |

## Deployment

- **API** → [Render.com](https://render.com) via `render.yaml` (Singapore region)
- **Web** → [Vercel](https://vercel.com) via `apps/web/vercel.json`

Set `NODE_ENV=production` and all required env vars in each platform's dashboard. Do **not** set `ALLOW_DEV_AUTOLOGIN` in any deployed environment.

## CI

GitHub Actions runs on every PR and push to `main`:
- TypeScript typecheck (api + web)
- API build (`tsc`)
- Web build (`vite build`)
- Prisma schema validation

See `.github/workflows/ci.yml`.
