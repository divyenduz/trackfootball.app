-- CreateEnum
CREATE TYPE "StravaWebhookEventStatus" AS ENUM ('PENDING', 'ERRORED', 'COMPLETED');

-- CreateTable
CREATE TABLE "StravaWebhookEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT NOT NULL,
    "status" "StravaWebhookEventStatus" NOT NULL,
    "body" TEXT NOT NULL,
    "errors" TEXT[],

    CONSTRAINT "StravaWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StravaWebhookEvent_objectId_key" ON "StravaWebhookEvent"("objectId");
