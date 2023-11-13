/*
  Warnings:

  - You are about to drop the column `matchId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_matchId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "matchId";

-- DropTable
DROP TABLE "Match";
