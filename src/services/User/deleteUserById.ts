import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import GetUserSchema from './schema/GetUserSchema';

const deleteUserById = async (id: string) => {
  const deletedUser: z.infer<typeof GetUserSchema> | null =
    await DBClient.instance.user.delete({
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

  return deletedUser;
};

export default deleteUserById;
