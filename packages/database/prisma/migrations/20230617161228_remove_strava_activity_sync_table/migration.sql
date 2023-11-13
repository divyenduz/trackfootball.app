/*
  Warnings:

  - You are about to drop the `StravaActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StravaActivity" DROP CONSTRAINT "StravaActivity_userId_fkey";

-- DropTable
DROP TABLE "StravaActivity";
