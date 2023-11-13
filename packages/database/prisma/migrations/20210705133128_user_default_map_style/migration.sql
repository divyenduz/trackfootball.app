-- CreateEnum
CREATE TYPE "MapStyle" AS ENUM ('SATELLITE', 'STREET');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultMapStyle" "MapStyle" NOT NULL DEFAULT E'STREET';
