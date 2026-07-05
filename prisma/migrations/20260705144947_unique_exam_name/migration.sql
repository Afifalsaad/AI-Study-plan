/*
  Warnings:

  - A unique constraint covering the columns `[userId,examName]` on the table `StudyPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_userId_examName_key" ON "StudyPlan"("userId", "examName");
