/*
  Warnings:

  - The values [FITBIT] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.
  - The values [FITBIT_ACTIVITY] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('STRAVA');
ALTER TABLE "SocialLogin" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "Platform_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('STRAVA_ACTIVITY');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "PostType_old";
COMMIT;
