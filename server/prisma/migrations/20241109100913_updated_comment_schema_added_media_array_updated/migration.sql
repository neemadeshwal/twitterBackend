/*
  Warnings:

  - A unique constraint covering the columns `[commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_commentId_key" ON "Like"("commentId");
