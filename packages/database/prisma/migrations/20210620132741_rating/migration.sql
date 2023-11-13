-- CreateEnum
CREATE TYPE "PostRating" AS ENUM ('NOT_SET', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "rating" "PostRating" NOT NULL DEFAULT E'NOT_SET';
