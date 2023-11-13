/*
  Warnings:

  - You are about to drop the column `detectedActivityType` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfRuns` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfSprints` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "detectedActivityType",
DROP COLUMN "numberOfRuns",
DROP COLUMN "numberOfSprints";
