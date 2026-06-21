/*
  Warnings:

  - You are about to drop the column `content` on the `Summary` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Summary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Summary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summaryText` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Summary" DROP COLUMN "content",
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" TEXT NOT NULL,
ADD COLUMN     "summaryPreview" TEXT,
ADD COLUMN     "summaryText" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
