/*
  Warnings:

  - You are about to drop the column `url` on the `BeerImage` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `BreweryImage` table. All the data in the column will be lost.
  - Added the required column `caption` to the `BeerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `BeerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedById` to the `BeerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caption` to the `BreweryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `BreweryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedById` to the `BreweryImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeerImage" DROP COLUMN "url",
ADD COLUMN     "caption" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "postedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BreweryImage" DROP COLUMN "url",
ADD COLUMN     "caption" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "postedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BeerImage" ADD CONSTRAINT "BeerImage_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryImage" ADD CONSTRAINT "BreweryImage_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
