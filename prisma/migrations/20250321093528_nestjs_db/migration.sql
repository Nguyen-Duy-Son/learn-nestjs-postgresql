/*
  Warnings:

  - You are about to drop the column `userId` on the `otps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otps" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_key" ON "otps"("email");
