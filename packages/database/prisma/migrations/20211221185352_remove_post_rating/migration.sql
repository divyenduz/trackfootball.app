/*
  Warnings:

  - You are about to drop the column `rating` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "rating";

-- DropEnum
DROP TYPE "PostRating";
