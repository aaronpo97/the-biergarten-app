import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const DBClient = {
  instance:
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['info', 'warn'],
    }),
};

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = DBClient.instance;
}

export default DBClient;
