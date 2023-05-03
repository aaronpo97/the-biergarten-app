-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerPost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ibu" DOUBLE PRECISION NOT NULL,
    "abv" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "breweryId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerPostLike" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "likedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryPostLike" (
    "id" TEXT NOT NULL,
    "breweryPostId" TEXT NOT NULL,
    "likedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerComment" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
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
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateOrProvince" TEXT,
    "country" TEXT,
    "coordinates" DOUBLE PRECISION[],
    "address" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryPost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,
    "dateEstablished" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BreweryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryComment" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "breweryPostId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerImage" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,

    CONSTRAINT "BeerImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryImage" (
    "id" TEXT NOT NULL,
    "breweryPostId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "caption" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,

    CONSTRAINT "BreweryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BreweryPost_locationId_key" ON "BreweryPost"("locationId");

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_breweryId_fkey" FOREIGN KEY ("breweryId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BeerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPostLike" ADD CONSTRAINT "BeerPostLike_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPostLike" ADD CONSTRAINT "BeerPostLike_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPostLike" ADD CONSTRAINT "BreweryPostLike_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPostLike" ADD CONSTRAINT "BreweryPostLike_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerType" ADD CONSTRAINT "BeerType_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPost" ADD CONSTRAINT "BreweryPost_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPost" ADD CONSTRAINT "BreweryPost_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryComment" ADD CONSTRAINT "BreweryComment_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryComment" ADD CONSTRAINT "BreweryComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerImage" ADD CONSTRAINT "BeerImage_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerImage" ADD CONSTRAINT "BeerImage_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryImage" ADD CONSTRAINT "BreweryImage_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryImage" ADD CONSTRAINT "BreweryImage_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
