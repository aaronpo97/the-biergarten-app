/*
  Warnings:

  - Added the required column `glasswareId` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeerStyle" ADD COLUMN     "abvRange" DOUBLE PRECISION[],
ADD COLUMN     "glasswareId" TEXT NOT NULL,
ADD COLUMN     "ibuRange" DOUBLE PRECISION[];

-- CreateTable
CREATE TABLE "Glassware" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "postedById" TEXT NOT NULL,

    CONSTRAINT "Glassware_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_glasswareId_fkey" FOREIGN KEY ("glasswareId") REFERENCES "Glassware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Glassware" ADD CONSTRAINT "Glassware_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
