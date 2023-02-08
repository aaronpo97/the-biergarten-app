-- CreateTable
CREATE TABLE "BeerPostLikes" (
    "id" TEXT NOT NULL,
    "beerPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BeerPostLikes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerPostLikes" ADD CONSTRAINT "BeerPostLikes_beerPostId_fkey" FOREIGN KEY ("beerPostId") REFERENCES "BeerPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerPostLikes" ADD CONSTRAINT "BeerPostLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
