/*
  Warnings:

  - Added the required column `alt` to the `BeerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alt` to the `BreweryImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeerImage" ADD COLUMN     "alt" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BreweryImage" ADD COLUMN     "alt" TEXT NOT NULL;
