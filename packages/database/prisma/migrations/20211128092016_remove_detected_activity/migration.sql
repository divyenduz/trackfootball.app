/*
  Warnings:

  - The values [RUN] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

-- Start: User Added
Update "Post" SET "detectedActivityType" = 'FOOTBALL';
-- End: User Added

CREATE TYPE "ActivityType_new" AS ENUM ('FOOTBALL');
ALTER TABLE "Post" ALTER COLUMN "detectedActivityType" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "detectedActivityType" TYPE "ActivityType_new" USING ("detectedActivityType"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";
ALTER TABLE "Post" ALTER COLUMN "detectedActivityType" SET DEFAULT 'FOOTBALL';
COMMIT;
