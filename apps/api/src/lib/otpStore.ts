import { Redis } from "ioredis"

const REDIS_URL = process.env["REDIS_URL"]
const IS_VERCEL = process.env["VERCEL"] === "1"
const hasRedis = !IS_VERCEL && !!REDIS_URL

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (!hasRedis) return null
  if (!_redis) {
    _redis = new Redis(REDIS_URL!)
    // Prevent unhandled error events from crashing the process
    _redis.on("error", () => {})
  }
  return _redis
}

const OTP_PREFIX = "otp:"
const OTP_TTL_SECONDS = 600

// ── Per-phone OTP send rate limit ─────────────────────────────────────────────
// Limits: 1 per minute, 5 per hour, 20 per day (per phone number)
const SEND_LIMITS: Array<{ key: string; max: number; ttl: number }> = [
  { key: "otp:rl:1m",  max: 1,  ttl: 60 },
  { key: "otp:rl:1h",  max: 5,  ttl: 3600 },
  { key: "otp:rl:1d",  max: 20, ttl: 86400 },
]

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number // seconds until reset for the binding window
}

/**
 * Increments all send-rate counters for a phone number.
 * Returns { allowed: false, retryAfter } if any window is exceeded.
 * When Redis is unavailable the check is skipped (fail-open) — acceptable
 * because the OTP_PROVIDER guard still limits real SMS delivery.
 */
export async function checkAndIncrSendRate(phone: string): Promise<RateLimitResult> {
  const r = getRedis()
  if (!r) return { allowed: true }

  for (const { key, max, ttl } of SEND_LIMITS) {
    const redisKey = `${key}:${phone}`
    const count = await r.incr(redisKey)
    if (count === 1) await r.expire(redisKey, ttl)
    if (count > max) {
      const retryAfter = await r.ttl(redisKey)
      return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : ttl }
    }
  }
  return { allowed: true }
}

// ── Failed verify attempt tracking ───────────────────────────────────────────
const FAIL_PREFIX = "otp:fail:"
const MAX_FAIL_ATTEMPTS = 5
const FAIL_LOCK_TTL = 3600 // 1-hour lockout

export interface LockoutResult {
  locked: boolean
  retryAfter?: number
}

export async function checkVerifyLockout(phone: string): Promise<LockoutResult> {
  const r = getRedis()
  if (!r) return { locked: false }
  const count = await r.get(`${FAIL_PREFIX}${phone}`)
  if (count && parseInt(count, 10) >= MAX_FAIL_ATTEMPTS) {
    const retryAfter = await r.ttl(`${FAIL_PREFIX}${phone}`)
    return { locked: true, retryAfter: retryAfter > 0 ? retryAfter : FAIL_LOCK_TTL }
  }
  return { locked: false }
}

export async function recordFailedVerify(phone: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  const key = `${FAIL_PREFIX}${phone}`
  const count = await r.incr(key)
  if (count === 1) await r.expire(key, FAIL_LOCK_TTL)
}

export async function clearFailedVerify(phone: string): Promise<void> {
  const r = getRedis()
  if (r) await r.del(`${FAIL_PREFIX}${phone}`)
}

// ── OTP storage ───────────────────────────────────────────────────────────────

export async function setOtp(phone: string, otp: string): Promise<void> {
  const r = getRedis()
  if (r) await r.setex(`${OTP_PREFIX}${phone}`, OTP_TTL_SECONDS, otp)
  // Without Redis on Vercel the OTP can't be stored server-side;
  // the dev bypass (code "1234") still works.
}

export async function getOtp(phone: string): Promise<string | null> {
  const r = getRedis()
  if (!r) return null
  return r.get(`${OTP_PREFIX}${phone}`)
}

export async function deleteOtp(phone: string): Promise<void> {
  const r = getRedis()
  if (r) await r.del(`${OTP_PREFIX}${phone}`)
}
