/*
  Warnings:

  - A unique constraint covering the columns `[key,type]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post.key_type_unique" ON "Post"("key", "type");
