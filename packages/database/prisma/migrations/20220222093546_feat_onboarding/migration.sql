-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardConnectWidget" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "onboardFollowWidget" BOOLEAN NOT NULL DEFAULT true;
