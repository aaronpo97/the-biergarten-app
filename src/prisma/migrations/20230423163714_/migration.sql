-- CreateTable
CREATE TABLE "BreweryPostLike" (
    "id" STRING NOT NULL,
    "breweryPostId" STRING NOT NULL,
    "likedById" STRING NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "BreweryPostLike_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BreweryPostLike" ADD CONSTRAINT "BreweryPostLike_breweryPostId_fkey" FOREIGN KEY ("breweryPostId") REFERENCES "BreweryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreweryPostLike" ADD CONSTRAINT "BreweryPostLike_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
