import type { FastifyInstance } from "fastify"
import { randomUUID } from "crypto"
import { readFile } from "fs/promises"
import path from "path"
import { prisma } from "../db/prisma.js"
import { generateCaptions as openaiGenerateCaptions } from "../services/openai.js"
import {
  generateCaptions as groqGenerateCaptions,
  isGroqAvailable,
} from "../services/groq.js"
import {
  generateCaptions as openrouterGenerateCaptions,
  isOpenRouterAvailable,
} from "../services/openrouter.js"
import {
  renderCreatives,
  extractHeadline,
} from "../services/templateRenderer.js"
import { ORIGINALS_DIR, CREATIVES_DIR } from "./upload.js"
import { uploadFile } from "../lib/storage.js"
import type { GeneratedCaptions } from "../services/openai.js"
import {
  generateImage as cfGenerateImage,
  isCloudflareAvailable,
} from "../services/cloudflareAI.js"

// Simple in-memory cache: key → {result, expires}
const captionCache = new Map<string, { result: unknown; expires: number }>()

// Try Groq → OpenRouter → mock
async function generateCaptionsAI(
  prompt: string,
  dealerContext: Parameters<typeof openaiGenerateCaptions>[1],
  inventoryContext?: Parameters<typeof openaiGenerateCaptions>[2],
  includeHindi = false,
): Promise<GeneratedCaptions> {
  // 1. Try Groq (primary)
  if (isGroqAvailable()) {
    try {
      return await groqGenerateCaptions(prompt, dealerContext, inventoryContext)
    } catch (err) {
      console.error("Groq generation failed, falling back to OpenRouter:", err)
    }
  }

  // 2. Try OpenRouter (fallback)
  if (isOpenRouterAvailable()) {
    try {
      return await openrouterGenerateCaptions(
        prompt,
        dealerContext,
        inventoryContext,
      )
    } catch (err) {
      console.error("OpenRouter generation failed, falling back to mock:", err)
    }
  }

  // 3. Mock fallback — 3 distinct angles
  const city = dealerContext.city.replace(/\s/g, "")
  return {
    variants: [
      {
        caption_text: `⚡ LIMITED TIME OFFER!\n\n${prompt}\n\nDon't miss out — visit ${dealerContext.name} in ${dealerContext.city} TODAY. Stock is limited!\n📞 Call now: ${dealerContext.phone}`,
        hashtags: [`#${city}`, "#LimitedOffer", "#CarDeal", "#ActNow"],
        suggested_emoji: ["⚡", "🚗", "📞"],
        platform_notes: "Best for Instagram Stories/Reels",
        style: "punchy",
      },
      {
        caption_text: `Here's why ${dealerContext.city} customers choose ${dealerContext.name}:\n\n✅ ${prompt}\n✅ Easy finance & EMI options\n✅ Trusted dealership with expert support\n✅ Test drive at your convenience\n\nVisit our showroom or call us at ${dealerContext.phone} to know more. We're here to make your car buying journey smooth and exciting!`,
        hashtags: [
          `#${city}`,
          "#CarBuying",
          "#TestDrive",
          "#AutoFinance",
          "#TrustedDealer",
        ],
        suggested_emoji: ["✅", "🚗", "💰"],
        platform_notes: "Best for Facebook",
        style: "detailed",
      },
      {
        caption_text: `Some journeys change everything.\n\n${prompt}.\n\nAt ${dealerContext.name}, we believe every family deserves the car of their dreams. Let us make yours happen.\n\n💬 WhatsApp us: ${dealerContext.whatsapp}`,
        hashtags: [`#${city}`, "#DreamCar", "#FamilyFirst", "#NewBeginnings"],
        suggested_emoji: ["❤️", "🌟", "🚗"],
        platform_notes: "Best for Instagram Feed",
        style: "emotional",
      },
    ],
  }
}

export default async function creativeRoutes(fastify: FastifyInstance) {
  // POST /v1/creatives/generate
  fastify.post(
    "/generate",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const dealer_id = request.user.dealer_id as string
      const body = request.body as {
        prompt: string
        platforms?: string[]
        image_id?: string // filename from POST /v1/upload/image
        force?: boolean // bypass caption cache
        includeHindi?: boolean
        language?: string
      }
      const { prompt, platforms, image_id, force } = body
      const includeHindi = body.includeHindi || body.language === "hi"

      if (!prompt?.trim()) {
        return reply
          .code(400)
          .send({
            error: { code: "INVALID_INPUT", message: "prompt is required" },
          })
      }

      const dealer = await prisma.dealer.findUnique({
        where: { id: dealer_id },
      })
      if (!dealer)
        return reply
          .code(404)
          .send({ error: { code: "NOT_FOUND", message: "Dealer not found" } })

      const dealerContext = {
        name: dealer.name,
        city: dealer.city,
        brands: (dealer.brands as string[] | null) ?? [],
        phone: dealer.contact_phone ?? dealer.phone,
        whatsapp: dealer.whatsapp_number ?? dealer.phone,
        language_preferences:
          (dealer.language_preferences as string[] | null) ?? [],
      }

      // Match inventory from prompt keywords
      const words = prompt.toLowerCase().split(/\s+/)
      const vehicleMatch = await prisma.inventoryItem.findFirst({
        where: {
          dealer_id,
          status: "in_stock",
          OR: words.map((w) => ({
            OR: [
              { make: { contains: w, mode: "insensitive" } },
              { model: { contains: w, mode: "insensitive" } },
            ],
          })),
        },
      })

      const inventoryContext = vehicleMatch
        ? {
            make: vehicleMatch.make,
            model: vehicleMatch.model,
            ...(vehicleMatch.variant ? { variant: vehicleMatch.variant } : {}),
            price: vehicleMatch.price,
            features: [] as string[],
            stock_count: vehicleMatch.stock_count,
          }
        : undefined

      // Cache captions (not images)
      const cacheKey = `${dealer_id}:${prompt}:${vehicleMatch?.id ?? "none"}`
      const cached = captionCache.get(cacheKey)
      const cachedCaptions =
        !force && cached && cached.expires > Date.now()
          ? (cached.result as GeneratedCaptions)
          : null

      let captions: GeneratedCaptions
      if (cachedCaptions) {
        captions = cachedCaptions
      } else {
        try {
          captions = await generateCaptionsAI(
            prompt,
            dealerContext,
            inventoryContext,
            includeHindi,
          )
          captionCache.set(cacheKey, {
            result: captions,
            expires: Date.now() + 24 * 60 * 60 * 1000,
          })
        } catch (err) {
          fastify.log.error(err, "Caption generation failed")
          return reply
            .code(500)
            .send({
              error: {
                code: "AI_ERROR",
                message: "Caption generation failed. Please try again.",
              },
            })
        }
      }

      // Render templates if an image was uploaded
      let creatives: Array<{
        id: string
        template_name: string
        thumbnail_url: string | null
        platform_urls: Record<string, string | null>
      }>

      if (image_id) {
        try {
          const imageBuffer = await readFile(path.join(ORIGINALS_DIR, image_id))
          const headline = extractHeadline(
            captions.variants[0]?.caption_text ?? prompt,
          )
          const filePrefix = randomUUID()

          const rendered = await renderCreatives({
            imageBuffer,
            headline,
            dealerName: dealer.name,
            city: dealer.city,
            phone: dealer.contact_phone ?? dealer.phone,
            whatsapp:
              dealer.whatsapp_number ?? dealer.contact_phone ?? dealer.phone,
            address: [dealer.city, dealer.state].filter(Boolean).join(", "),
            primaryColor: dealer.primary_color ?? "#1877F2",
            ...(inventoryContext?.price != null
              ? { price: inventoryContext.price }
              : {}),
            outputDir: CREATIVES_DIR,
            filePrefix,
          })

          // Upload rendered files (S3/R2 in prod, local URL in dev)
          const { readFile: readRendered } = await import("fs/promises")
          const uploadRendered = async (filename: string) => {
            const buf = await readRendered(path.join(CREATIVES_DIR, filename))
            return uploadFile(
              buf,
              `creatives/${filename}`,
              "image/png",
              CREATIVES_DIR,
            )
          }

          const [bbUrl, msUrl, ocUrl] = await Promise.all([
            uploadRendered(rendered.boldBanner),
            uploadRendered(rendered.minimalShowcase),
            uploadRendered(rendered.offerCard),
          ])

          creatives = [
            {
              id: "tpl_bold_banner",
              template_name: "Bold Banner",
              thumbnail_url: bbUrl,
              platform_urls: {
                facebook: bbUrl,
                instagram: bbUrl,
                instagram_story: null,
                gmb: bbUrl,
              },
            },
            {
              id: "tpl_minimal",
              template_name: "Minimal Showcase",
              thumbnail_url: msUrl,
              platform_urls: {
                facebook: msUrl,
                instagram: msUrl,
                instagram_story: null,
                gmb: msUrl,
              },
            },
            {
              id: "tpl_offer_card",
              template_name: "Offer Card",
              thumbnail_url: ocUrl,
              platform_urls: {
                facebook: ocUrl,
                instagram: ocUrl,
                instagram_story: null,
                gmb: ocUrl,
              },
            },
          ]
        } catch (err) {
          fastify.log.error(
            err,
            "Template rendering failed, using placeholders",
          )
          creatives = mockCreatives()
        }
      } else {
        creatives = mockCreatives()
      }

      const hindiCaptions =
        captions.hindi_variants?.length === 3
          ? captions.hindi_variants.map((captionText, idx) => ({
              caption_text: captionText,
              hashtags: captions.variants[idx]?.hashtags ?? [],
              suggested_emoji: captions.variants[idx]?.suggested_emoji ?? [],
              platform_notes: captions.variants[idx]?.platform_notes ?? "",
              style: captions.variants[idx]?.style,
            }))
          : null

      return {
        success: true,
        captions: captions.variants,
        hindi_captions: hindiCaptions,
        creatives,
        inventory_matched: vehicleMatch
          ? {
              id: vehicleMatch.id,
              make: vehicleMatch.make,
              model: vehicleMatch.model,
              price: vehicleMatch.price,
            }
          : null,
        platforms_requested: platforms ?? ["facebook", "instagram", "gmb"],
        cached: !!cachedCaptions,
      }
    },
  )

  // POST /v1/creatives/generate-image  (Cloudflare Workers AI fallback for image generation)
  fastify.post(
    "/generate-image",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { prompt } = request.body as { prompt: string }
      if (!prompt?.trim()) {
        return reply
          .code(400)
          .send({
            error: { code: "INVALID_INPUT", message: "prompt is required" },
          })
      }

      if (!isCloudflareAvailable()) {
        return reply
          .code(503)
          .send({
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: "Image generation not configured",
            },
          })
      }

      try {
        const imageBuffer = await cfGenerateImage(prompt.slice(0, 500))
        const base64 = imageBuffer.toString("base64")
        return { image: base64 }
      } catch (err) {
        fastify.log.error(err, "Cloudflare image generation failed")
        return reply
          .code(500)
          .send({
            error: {
              code: "AI_ERROR",
              message: "Image generation failed. Please try again.",
            },
          })
      }
    },
  )

  // GET /v1/creatives/prompts
  fastify.get("/prompts", async (request, _reply) => {
    const { category, limit = "10" } = request.query as {
      category?: string
      limit?: string
    }
    const where = category ? { category, is_active: true } : { is_active: true }
    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: [{ usage_count: "desc" }, { sort_order: "asc" }],
      take: parseInt(limit),
    })
    return { success: true, data: prompts }
  })
}

function mockCreatives() {
  return [
    {
      id: "tpl_bold_banner",
      template_name: "Bold Banner",
      thumbnail_url: null,
      platform_urls: {
        facebook: null,
        instagram: null,
        instagram_story: null,
        gmb: null,
      },
    },
    {
      id: "tpl_minimal",
      template_name: "Minimal Showcase",
      thumbnail_url: null,
      platform_urls: {
        facebook: null,
        instagram: null,
        instagram_story: null,
        gmb: null,
      },
    },
    {
      id: "tpl_offer_card",
      template_name: "Offer Card",
      thumbnail_url: null,
      platform_urls: {
        facebook: null,
        instagram: null,
        instagram_story: null,
        gmb: null,
      },
    },
  ]
}
