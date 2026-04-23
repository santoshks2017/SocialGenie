-- CreateTable
CREATE TABLE "InspirationHandle" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle_url" TEXT NOT NULL,
    "handle_name" TEXT,
    "posts_cache" JSONB,
    "last_scraped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspirationHandle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InspirationHandle_dealer_id_idx" ON "InspirationHandle"("dealer_id");

-- CreateIndex
CREATE UNIQUE INDEX "InspirationHandle_dealer_id_handle_url_key" ON "InspirationHandle"("dealer_id", "handle_url");

-- AddForeignKey
ALTER TABLE "InspirationHandle" ADD CONSTRAINT "InspirationHandle_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
