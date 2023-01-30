/*
  Warnings:

  - Added the required column `rating` to the `BeerComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `BreweryComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeerComment" ADD COLUMN     "rating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BreweryComment" ADD COLUMN     "rating" INTEGER NOT NULL;
