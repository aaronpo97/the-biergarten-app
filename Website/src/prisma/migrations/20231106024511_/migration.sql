/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BreweryPost" DROP CONSTRAINT "BreweryPost_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_postedById_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "UserAvatar" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryLocation" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateOrProvince" TEXT,
    "country" TEXT,
    "coordinates" DOUBLE PRECISION[],
    "address" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatar_userId_key" ON "UserAvatar"("userId");

-- AddForeignKey
ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryLocation" ADD CONSTRAINT "BreweryLocation_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPost" ADD CONSTRAINT "BreweryPost_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "BreweryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
