-- CreateTable
CREATE TABLE "BeerPostLike" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPostLike_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerPostLike" ADD CONSTRAINT "BeerPostLike_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPostLike" ADD CONSTRAINT "BeerPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
