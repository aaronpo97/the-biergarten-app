/*
  Warnings:

  - Added the required column `description` to the `BeerPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `BreweryPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeerPost" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BreweryPost" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
