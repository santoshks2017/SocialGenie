import { Redis } from "ioredis"

const redis = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379")

const OTP_PREFIX = "otp:"
const OTP_TTL_SECONDS = 600 // 10 minutes

export async function setOtp(phone: string, otp: string): Promise<void> {
  await redis.setex(`${OTP_PREFIX}${phone}`, OTP_TTL_SECONDS, otp)
}

export async function getOtp(phone: string): Promise<string | null> {
  return await redis.get(`${OTP_PREFIX}${phone}`)
}

export async function deleteOtp(phone: string): Promise<void> {
  await redis.del(`${OTP_PREFIX}${phone}`)
}
