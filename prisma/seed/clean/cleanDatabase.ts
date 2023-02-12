import DBClient from '../../DBClient';

const cleanDatabase = async () => {
  const prisma = DBClient.instance;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerPost" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerType" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BreweryPost" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerComment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BreweryComment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerPostLike" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerImage" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BreweryImage" CASCADE`;

  await prisma.$disconnect();
};

export default cleanDatabase;
