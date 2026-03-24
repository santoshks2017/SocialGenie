-- CreateTable
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "brands" JSONB,
    "showroom_type" TEXT[],
    "logo_url" TEXT,
    "primary_color" TEXT DEFAULT '#1A1A2E',
    "secondary_color" TEXT DEFAULT '#FFFFFF',
    "contact_phone" TEXT,
    "whatsapp_number" TEXT,
    "plan" TEXT DEFAULT 'starter',
    "plan_expires_at" TIMESTAMP(3),
    "onboarding_step" INTEGER NOT NULL DEFAULT 1,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "language_preferences" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "region" TEXT,
    "timezone" TEXT DEFAULT 'Asia/Kolkata',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platform_account_id" TEXT NOT NULL,
    "platform_account_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "ad_account_id" TEXT,
    "is_connected" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "spec" JSONB NOT NULL,
    "thumbnail_url" TEXT,
    "platforms" TEXT[],
    "regional_variants" TEXT[],
    "festival_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "text_en" TEXT NOT NULL,
    "text_hi" TEXT,
    "text_regional" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "prompt_id" TEXT,
    "selected_variant_index" INTEGER,
    "caption_text" TEXT,
    "caption_hashtags" TEXT[],
    "creative_urls" JSONB,
    "template_id" TEXT,
    "inventory_item_ids" TEXT[],
    "platforms" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "publish_results" JSONB,
    "metrics" JSONB,
    "metrics_last_fetched" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostCampaign" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "meta_campaign_id" TEXT,
    "meta_adset_id" TEXT,
    "meta_ad_id" TEXT,
    "daily_budget" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "targeting_spec" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_spent" INTEGER NOT NULL DEFAULT 0,
    "metrics" JSONB,
    "metrics_last_fetched" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoostCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "platform_message_id" TEXT NOT NULL,
    "post_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_avatar_url" TEXT,
    "customer_platform_id" TEXT,
    "message_text" TEXT NOT NULL,
    "sentiment" TEXT,
    "tag" TEXT,
    "ai_suggested_reply" TEXT,
    "reply_text" TEXT,
    "replied_at" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "color" TEXT,
    "fuel_type" TEXT,
    "transmission" TEXT,
    "mileage_km" INTEGER,
    "stock_count" INTEGER NOT NULL DEFAULT 1,
    "image_urls" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'in_stock',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Festival" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_hi" TEXT,
    "name_regional" JSONB,
    "date" TIMESTAMP(3) NOT NULL,
    "regions" TEXT[],
    "category" TEXT,
    "campaign_type" TEXT,
    "template_ids" TEXT[],
    "auto_suggest_days_before" INTEGER NOT NULL DEFAULT 14,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Festival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "source_platform" TEXT,
    "source_type" TEXT,
    "source_post_id" TEXT,
    "source_campaign_id" TEXT,
    "source_message_id" TEXT,
    "vehicle_interest" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_phone_key" ON "Dealer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_dealer_id_platform_key" ON "PlatformConnection"("dealer_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "InboxMessage_platform_message_id_key" ON "InboxMessage"("platform_message_id");

-- AddForeignKey
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "Dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
