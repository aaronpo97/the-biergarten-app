-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerPost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ibu" DOUBLE PRECISION NOT NULL,
    "abv" DOUBLE PRECISION NOT NULL,
    "postedById" TEXT NOT NULL,
    "breweryId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerComment" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,

    CONSTRAINT "BeerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryPost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,

    CONSTRAINT "BreweryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryComment" (
    "id" TEXT NOT NULL,
    "breweryPostId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "BreweryPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BeerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerType" ADD CONSTRAINT "BeerType_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPost" ADD CONSTRAINT "BreweryPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryComment" ADD CONSTRAINT "BreweryComment_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryComment" ADD CONSTRAINT "BreweryComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
