import DBClient from '../../DBClient';

const cleanDatabase = async () => {
  const prisma = DBClient.instance;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerPost" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerType" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BreweryPost" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BeerComment" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "BreweryComment" CASCADE`;
};

export default cleanDatabase;
