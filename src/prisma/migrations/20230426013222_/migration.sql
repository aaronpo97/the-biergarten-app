/*
  Warnings:

  - You are about to drop the column `address` on the `BreweryPost` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `BreweryPost` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `BreweryPost` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `BreweryPost` table. All the data in the column will be lost.
  - You are about to drop the column `stateOrProvince` on the `BreweryPost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[locationId]` on the table `BreweryPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locationId` to the `BreweryPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BreweryPost" DROP COLUMN "address";
ALTER TABLE "BreweryPost" DROP COLUMN "city";
ALTER TABLE "BreweryPost" DROP COLUMN "coordinates";
ALTER TABLE "BreweryPost" DROP COLUMN "country";
ALTER TABLE "BreweryPost" DROP COLUMN "stateOrProvince";
ALTER TABLE "BreweryPost" ADD COLUMN     "locationId" STRING NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" STRING NOT NULL,
    "city" STRING NOT NULL,
    "stateOrProvince" STRING,
    "country" STRING,
    "coordinates" FLOAT8[],
    "address" STRING NOT NULL,
    "postedById" STRING NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BreweryPost_locationId_key" ON "BreweryPost"("locationId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPost" ADD CONSTRAINT "BreweryPost_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
