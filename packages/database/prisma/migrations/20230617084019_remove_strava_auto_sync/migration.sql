/*
  Warnings:

  - The values [MANUAL,AUTO_SYNC] on the enum `PostSyncType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `autoSyncStrava` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostSyncType_new" AS ENUM ('WEBHOOK_SYNC');
ALTER TABLE "Post" ALTER COLUMN "syncType" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "syncType" TYPE "PostSyncType_new" USING ("syncType"::text::"PostSyncType_new");
ALTER TYPE "PostSyncType" RENAME TO "PostSyncType_old";
ALTER TYPE "PostSyncType_new" RENAME TO "PostSyncType";
DROP TYPE "PostSyncType_old";
ALTER TABLE "Post" ALTER COLUMN "syncType" SET DEFAULT 'WEBHOOK_SYNC';
COMMIT;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "isAutoSync" SET DEFAULT true,
ALTER COLUMN "syncType" SET DEFAULT 'WEBHOOK_SYNC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "autoSyncStrava";
