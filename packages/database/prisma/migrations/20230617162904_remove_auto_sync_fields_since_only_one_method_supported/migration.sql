/*
  Warnings:

  - You are about to drop the column `isAutoSync` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `syncType` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isAutoSync",
DROP COLUMN "syncType";

-- DropEnum
DROP TYPE "PostSyncType";
