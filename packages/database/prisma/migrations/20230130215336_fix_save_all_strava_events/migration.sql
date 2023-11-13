/*
  Warnings:

  - You are about to drop the column `objectId` on the `StravaWebhookEvent` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostSyncType" AS ENUM ('MANUAL', 'AUTO_SYNC', 'WEBHOOK_SYNC');

-- DropIndex
DROP INDEX "StravaWebhookEvent_objectId_key";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "syncType" "PostSyncType" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "StravaWebhookEvent" DROP COLUMN "objectId";
