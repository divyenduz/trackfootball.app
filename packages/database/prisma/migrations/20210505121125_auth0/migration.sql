/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LoginSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth0Sub]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LoginSession" DROP CONSTRAINT "LoginSession_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT E'en',
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "auth0Sub" TEXT;

-- DropTable
DROP TABLE "LoginSession";

-- CreateIndex
CREATE UNIQUE INDEX "User.auth0Sub_unique" ON "User"("auth0Sub");
