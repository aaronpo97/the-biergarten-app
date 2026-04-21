-- CreateTable
CREATE TABLE "BeerStyleLike" (
    "id" TEXT NOT NULL,
    "beerStyleId" TEXT NOT NULL,
    "likedById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerStyleLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerStyleComment" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "beerStyleId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerStyleComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerStyleLike" ADD CONSTRAINT "BeerStyleLike_beerStyleId_fkey" FOREIGN KEY ("beerStyleId") REFERENCES "BeerStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerStyleLike" ADD CONSTRAINT "BeerStyleLike_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerStyleComment" ADD CONSTRAINT "BeerStyleComment_beerStyleId_fkey" FOREIGN KEY ("beerStyleId") REFERENCES "BeerStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerStyleComment" ADD CONSTRAINT "BeerStyleComment_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
