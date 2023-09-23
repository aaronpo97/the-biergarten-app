import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import GetUserSchema from './schema/GetUserSchema';

const findUserById = async (id: string) => {
  const user: z.infer<typeof GetUserSchema> | null =
    await DBClient.instance.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        createdAt: true,
        accountIsVerified: true,
        updatedAt: true,
        role: true,
      },
    });

  return user;
};

export default findUserById;
