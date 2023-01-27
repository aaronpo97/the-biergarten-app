-- DropForeignKey
ALTER TABLE
    "BeerComment" DROP CONSTRAINT "BeerComment_beerPostId_fkey";

-- DropForeignKey
ALTER TABLE
    "BeerComment" DROP CONSTRAINT "BeerComment_postedById_fkey";

-- DropForeignKey
ALTER TABLE
    "BeerPost" DROP CONSTRAINT "BeerPost_breweryId_fkey";

-- DropForeignKey
ALTER TABLE
    "BeerPost" DROP CONSTRAINT "BeerPost_postedById_fkey";

-- DropForeignKey
ALTER TABLE
    "BeerPost" DROP CONSTRAINT "BeerPost_typeId_fkey";

-- DropForeignKey
ALTER TABLE
    "BeerType" DROP CONSTRAINT "BeerType_postedById_fkey";

-- DropForeignKey
ALTER TABLE
    "BreweryComment" DROP CONSTRAINT "BreweryComment_postedById_fkey";

-- DropForeignKey
ALTER TABLE
    "BreweryPost" DROP CONSTRAINT "BreweryPost_postedById_fkey";

-- CreateTable
CREATE TABLE "BeerImage" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    CONSTRAINT "BeerImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryImage" (
    "id" TEXT NOT NULL,
    "breweryPostId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    CONSTRAINT "BreweryImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE
    "BeerPost"
ADD
    CONSTRAINT "BeerPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerPost"
ADD
    CONSTRAINT "BeerPost_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerPost"
ADD
    CONSTRAINT "BeerPost_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BeerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerComment"
ADD
    CONSTRAINT "BeerComment_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerComment"
ADD
    CONSTRAINT "BeerComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerType"
ADD
    CONSTRAINT "BeerType_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BreweryPost"
ADD
    CONSTRAINT "BreweryPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BreweryComment"
ADD
    CONSTRAINT "BreweryComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BeerImage"
ADD
    CONSTRAINT "BeerImage_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "BreweryImage"
ADD
    CONSTRAINT "BreweryImage_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;