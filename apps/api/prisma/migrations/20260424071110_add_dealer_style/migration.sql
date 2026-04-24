-- CreateTable
CREATE TABLE "DealerStyle" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "festivals" TEXT[],
    "imageCount" INTEGER NOT NULL,
    "hasPhone" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealerStyle_pkey" PRIMARY KEY ("id")
);
