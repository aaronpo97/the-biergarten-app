/*
  Warnings:

  - You are about to drop the column `userId` on the `BeerPostLike` table. All the data in the column will be lost.
  - Added the required column `likedById` to the `BeerPostLike` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BeerPostLike" DROP CONSTRAINT "BeerPostLike_userId_fkey";

-- AlterTable
ALTER TABLE "BeerPostLike" DROP COLUMN "userId",
ADD COLUMN     "likedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BeerPostLike" ADD CONSTRAINT "BeerPostLike_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
