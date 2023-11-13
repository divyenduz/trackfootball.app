-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isAutoSync" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StravaActivity" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
