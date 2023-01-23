-- DropForeignKey
ALTER TABLE "BeerImage" DROP CONSTRAINT "BeerImage_beerPostId_fkey";

-- DropForeignKey
ALTER TABLE "BreweryComment" DROP CONSTRAINT "BreweryComment_breweryPostId_fkey";

-- DropForeignKey
ALTER TABLE "BreweryImage" DROP CONSTRAINT "BreweryImage_breweryPostId_fkey";

-- AddForeignKey
ALTER TABLE "BreweryComment" ADD CONSTRAINT "BreweryComment_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerImage" ADD CONSTRAINT "BeerImage_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryImage" ADD CONSTRAINT "BreweryImage_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
