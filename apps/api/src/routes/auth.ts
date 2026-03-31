import type { FastifyInstance } from "fastify"
import { prisma } from "../db/prisma.js"
import { resolvePermissions, ROLES } from "../lib/permissions.js"
import type { Role, JwtUser } from "../lib/permissions.js"
import { setOtp, getOtp, deleteOtp } from "../lib/otpStore.js"

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
}
