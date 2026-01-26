/*
  Warnings:

  - You are about to drop the column `typeId` on the `BeerPost` table. All the data in the column will be lost.
  - You are about to drop the `BeerType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `styleId` to the `BeerPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BeerPost" DROP CONSTRAINT "BeerPost_typeId_fkey";

-- DropForeignKey
ALTER TABLE "BeerType" DROP CONSTRAINT "BeerType_postedById_fkey";

-- AlterTable
ALTER TABLE "BeerPost" DROP COLUMN "typeId",
ADD COLUMN     "styleId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BeerType";

-- CreateTable
CREATE TABLE "BeerStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,

    CONSTRAINT "BeerStyle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerPost" ADD CONSTRAINT "BeerPost_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "BeerStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
