/*
  Warnings:

  - You are about to drop the column `location` on the `BreweryPost` table. All the data in the column will be lost.
  - Added the required column `address` to the `BreweryPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `BreweryPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BreweryPost" DROP COLUMN "location";
ALTER TABLE "BreweryPost" ADD COLUMN     "address" STRING NOT NULL;
ALTER TABLE "BreweryPost" ADD COLUMN     "city" STRING NOT NULL;
ALTER TABLE "BreweryPost" ADD COLUMN     "coordinates" FLOAT8[];
ALTER TABLE "BreweryPost" ADD COLUMN     "country" STRING;
ALTER TABLE "BreweryPost" ADD COLUMN     "stateOrProvince" STRING;
