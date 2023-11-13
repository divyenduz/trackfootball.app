-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RUN', 'FOOTBALL');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "area" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "detectedActivityType" "ActivityType" NOT NULL DEFAULT E'FOOTBALL';
