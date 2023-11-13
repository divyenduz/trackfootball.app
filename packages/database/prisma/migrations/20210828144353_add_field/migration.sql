-- CreateEnum
CREATE TYPE "FieldUsage" AS ENUM ('FULL_FIELD', 'BOTTOM_HALF', 'TOP_HALF');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "fieldId" INTEGER;

-- CreateTable
CREATE TABLE "Field" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "topLeft" DOUBLE PRECISION[],
    "topRight" DOUBLE PRECISION[],
    "bottomRight" DOUBLE PRECISION[],
    "bottomLeft" DOUBLE PRECISION[],
    "city" TEXT NOT NULL,
    "address" TEXT,
    "usage" "FieldUsage" NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;
