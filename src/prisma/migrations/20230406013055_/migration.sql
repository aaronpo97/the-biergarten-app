-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "username" STRING NOT NULL,
    "firstName" STRING NOT NULL,
    "lastName" STRING NOT NULL,
    "hash" STRING NOT NULL,
    "email" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "isAccountVerified" BOOL NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerPost" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "ibu" FLOAT8 NOT NULL,
    "abv" FLOAT8 NOT NULL,
    "description" STRING NOT NULL,
    "postedById" STRING NOT NULL,
    "breweryId" STRING NOT NULL,
    "typeId" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerPostLike" (
    "id" STRING NOT NULL,
    "beerPostId" STRING NOT NULL,
    "likedById" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerComment" (
    "id" STRING NOT NULL,
    "rating" INT4 NOT NULL,
    "beerPostId" STRING NOT NULL,
    "postedById" STRING NOT NULL,
    "content" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerType" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" STRING NOT NULL,

    CONSTRAINT "BeerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryPost" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "location" STRING NOT NULL,
    "description" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" STRING NOT NULL,

    CONSTRAINT "BreweryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryComment" (
    "id" STRING NOT NULL,
    "rating" INT4 NOT NULL,
    "breweryPostId" STRING NOT NULL,
    "postedById" STRING NOT NULL,
    "content" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerImage" (
    "id" STRING NOT NULL,
    "beerPostId" STRING NOT NULL,
    "path" STRING NOT NULL,
    "alt" STRING NOT NULL,
    "caption" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" STRING NOT NULL,

    CONSTRAINT "BeerImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreweryImage" (
    "id" STRING NOT NULL,
    "breweryPostId" STRING NOT NULL,
    "path" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "caption" STRING NOT NULL,
    "alt" STRING NOT NULL,
    "postedById" STRING NOT NULL,

    CONSTRAINT "BreweryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerComment" ADD CONSTRAINT "BeerComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerType" ADD CONSTRAINT "BeerType_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
