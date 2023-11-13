/*
  Warnings:

  - Changed the type of `sprints` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `runs` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "sprints",
ADD COLUMN     "sprints" JSONB NOT NULL,
DROP COLUMN "runs",
ADD COLUMN     "runs" JSONB NOT NULL;
