/*
  Warnings:

  - You are about to drop the column `movingTime` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `totalRunTime` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "movingTime",
DROP COLUMN "totalRunTime";
