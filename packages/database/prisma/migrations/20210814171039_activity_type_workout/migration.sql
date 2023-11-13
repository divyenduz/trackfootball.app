/*
  Warnings:

  - Made the column `startTime` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'WORKOUT';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "startTime" SET NOT NULL;
