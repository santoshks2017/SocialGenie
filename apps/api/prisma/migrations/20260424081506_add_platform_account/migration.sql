-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformAccount_userId_idx" ON "PlatformAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAccount_userId_platform_accountId_key" ON "PlatformAccount"("userId", "platform", "accountId");
