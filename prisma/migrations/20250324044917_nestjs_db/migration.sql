/*
  Warnings:

  - You are about to drop the column `otp` on the `otps` table. All the data in the column will be lost.
  - Added the required column `otpCode` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otps" DROP COLUMN "otp",
ADD COLUMN     "otpCode" TEXT NOT NULL;
