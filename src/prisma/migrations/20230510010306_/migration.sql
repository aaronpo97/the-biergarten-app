/*
  Warnings:

  - You are about to drop the column `isAccountVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAccountVerified",
ADD COLUMN     "accountIsVerified" BOOLEAN NOT NULL DEFAULT false;
