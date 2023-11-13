/*
  Warnings:

  - You are about to drop the column `averageHeartRate` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `maxHeartRate` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "averageHeartRate",
DROP COLUMN "maxHeartRate";
