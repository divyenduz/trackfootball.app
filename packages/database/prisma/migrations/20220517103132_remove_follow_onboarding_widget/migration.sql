-- AlterTable
ALTER TABLE "User" ALTER COLUMN "onboardFollowWidget" SET DEFAULT false;

UPDATE "User" SET "onboardFollowWidget" = false;