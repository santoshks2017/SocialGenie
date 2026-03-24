/*
  Warnings:

  - You are about to drop the column `dealer_id` on the `UserSession` table. All the data in the column will be lost.
  - Added the required column `dealer_user_id` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_dealer_id_fkey";

-- DropIndex
DROP INDEX "UserSession_dealer_id_idx";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "dealer_user_id" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "requires_approval" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "dealer_id",
ADD COLUMN     "dealer_user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DealerUser" (
    "id" TEXT NOT NULL,
    "dealer_id" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL DEFAULT 'New User',
    "role" TEXT NOT NULL DEFAULT 'user',
    "permissions" JSONB,
    "invited_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealerUser_phone_key" ON "DealerUser"("phone");

-- CreateIndex
CREATE INDEX "DealerUser_dealer_id_idx" ON "DealerUser"("dealer_id");

-- CreateIndex
CREATE INDEX "DealerUser_phone_idx" ON "DealerUser"("phone");

-- CreateIndex
CREATE INDEX "ActivityLog_dealer_user_id_idx" ON "ActivityLog"("dealer_user_id");

-- CreateIndex
CREATE INDEX "UserSession_dealer_user_id_idx" ON "UserSession"("dealer_user_id");

-- AddForeignKey
ALTER TABLE "DealerUser" ADD CONSTRAINT "DealerUser_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_dealer_user_id_fkey" FOREIGN KEY ("dealer_user_id") REFERENCES "DealerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_dealer_user_id_fkey" FOREIGN KEY ("dealer_user_id") REFERENCES "DealerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
