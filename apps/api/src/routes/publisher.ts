import type { FastifyInstance } from "fastify"
import { prisma } from "../db/prisma.js"
import { publishQueue } from "../queues/index.js"
import type { PublishJobData } from "../queues/index.js"

export default async function publisherRoutes(fastify: FastifyInstance) {
  // POST /v1/publisher/posts — create a draft post
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const dealer_id = request.user.dealer_id
      const body = request.body as {
        promptText: string
        captionText?: string
        captionHashtags?: string[]
        creativeUrls?: Record<string, string>
        platforms: string[]
      }

      if (!body.promptText || !body.platforms?.length) {
        return reply
          .code(400)
          .send({
            error: {
              code: "INVALID_INPUT",
              message: "promptText and platforms are required",
            },
          })
      }

      const post = await prisma.post.create({
        data: {
          dealer_id,
          prompt_text: body.promptText,
          ...(body.captionText ? { caption_text: body.captionText } : {}),
          caption_hashtags: body.captionHashtags ?? [],
          ...(body.creativeUrls ? { creative_urls: body.creativeUrls } : {}),
          platforms: body.platforms,
          status: "draft",
        },
      })

      return { success: true, item: post }
    },
  )

  // POST /v1/publisher/publish  — publish immediately or schedule
  fastify.post(
    "/publish",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const dealer_id = request.user.dealer_id
      const { post_id, platforms, scheduled_at } = request.body as {
        post_id: string
        platforms: string[]
        scheduled_at?: string // ISO string — if present, schedule; otherwise publish now
      }

      if (!post_id || !platforms?.length) {
        return reply
          .code(400)
          .send({
            error: {
              code: "INVALID_INPUT",
              message: "post_id and platforms are required",
            },
          })
      }

      // Verify the post belongs to this dealer
      const post = await prisma.post.findFirst({
        where: { id: post_id, dealer_id },
      })
      if (!post)
        return reply
          .code(404)
          .send({ error: { code: "NOT_FOUND", message: "Post not found" } })

      // Load platform connections for this dealer
      const connections = await prisma.platformConnection.findMany({
        where: { dealer_id, is_connected: true },
      })
      const connMap = Object.fromEntries(
        connections.map((c) => [c.platform, c]),
      )

      const delay = scheduled_at
        ? Math.max(0, new Date(scheduled_at).getTime() - Date.now())
        : 0

      const jobIds: string[] = []
      const skipped: string[] = []

      for (const platform of platforms) {
        const conn = connMap[platform]
        if (!conn) {
          skipped.push(platform)
          continue
        }

        // Build job payload
        const jobData: PublishJobData = {
          post_id,
          dealer_id,
          platform: platform as PublishJobData["platform"],
          image_url:
            (post.creative_urls as Record<string, string> | null)?.[platform] ??
            "",
          caption: post.caption_text ?? "",
          access_token: conn.access_token,
        }

        if (platform === "facebook") jobData.page_id = conn.platform_account_id
        if (platform === "instagram")
          jobData.ig_user_id = conn.platform_account_id
        if (platform === "gmb")
          jobData.gmb_location_name = conn.platform_account_id

        const job = await publishQueue.add(
          `publish-${platform}-${post_id}`,
          jobData,
          {
            delay,
            attempts: 3,
            backoff: { type: "exponential", delay: 60_000 },
          },
        )

        if (job.id) jobIds.push(job.id)
      }

      // Update post status
      const newStatus = scheduled_at ? "scheduled" : "publishing"
      await prisma.post.update({
        where: { id: post_id },
        data: {
          status: newStatus,
          platforms,
          ...(scheduled_at ? { scheduled_at: new Date(scheduled_at) } : {}),
        },
      })

      return {
        success: true,
        status: newStatus,
        job_ids: jobIds,
        skipped_platforms: skipped,
        scheduled_at: scheduled_at ?? null,
      }
    },
  )

  // GET /v1/publisher/status/:jobId
  fastify.get(
    "/status/:jobId",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { jobId } = request.params as { jobId: string }
      const job = await publishQueue.getJob(jobId)
      if (!job)
        return reply
          .code(404)
          .send({ error: { code: "NOT_FOUND", message: "Job not found" } })

      const state = await job.getState()
      return {
        success: true,
        job_id: jobId,
        status: state,
        result: job.returnvalue ?? null,
        failed_reason: job.failedReason ?? null,
        attempts_made: job.attemptsMade,
      }
    },
  )

  // GET /v1/publisher/calendar  — posts for calendar view
  fastify.get(
    "/calendar",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, _reply) => {
      const dealer_id = request.user.dealer_id
      const { from, to } = request.query as { from?: string; to?: string }

      const dateRange =
        from || to
          ? {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            }
          : null

      const posts = await prisma.post.findMany({
        where: {
          dealer_id,
          ...(dateRange
            ? {
                OR: [
                  { scheduled_at: dateRange },
                  { scheduled_at: null, created_at: dateRange },
                ],
              }
            : {}),
        },
        orderBy: [{ scheduled_at: "asc" }, { created_at: "asc" }],
        select: {
          id: true,
          prompt_text: true,
          caption_text: true,
          platforms: true,
          status: true,
          scheduled_at: true,
          published_at: true,
          creative_urls: true,
          metrics: true,
        },
      })

      return { success: true, data: posts }
    },
  )

  // DELETE /v1/publisher/:postId  — cancel scheduled post
  fastify.delete(
    "/:postId",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const dealer_id = request.user.dealer_id
      const { postId } = request.params as { postId: string }

      const post = await prisma.post.findFirst({
        where: { id: postId, dealer_id },
      })
      if (!post)
        return reply
          .code(404)
          .send({ error: { code: "NOT_FOUND", message: "Post not found" } })
      if (post.status === "published") {
        return reply
          .code(400)
          .send({
            error: {
              code: "ALREADY_PUBLISHED",
              message: "Cannot cancel a published post",
            },
          })
      }

      // Remove pending jobs from queue
      const jobs = await publishQueue.getJobs(["delayed", "waiting"])
      for (const job of jobs) {
        if (job.data.post_id === postId) await job.remove()
      }

      await prisma.post.update({
        where: { id: postId },
        data: { status: "draft", scheduled_at: null },
      })
      return { success: true }
    },
  )
}
