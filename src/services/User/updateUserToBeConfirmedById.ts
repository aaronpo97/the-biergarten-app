import GetUserSchema from '@/services/User/schema/GetUserSchema';
import DBClient from '@/prisma/DBClient';
import { z } from 'zod';

const updateUserToBeConfirmedById = async (id: string) => {
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: { accountIsVerified: true, updatedAt: new Date() },
    select: {
      id: true,
      username: true,
      email: true,
      accountIsVerified: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      updatedAt: true,
      dateOfBirth: true,
    },
  });

  return user;
};

export default updateUserToBeConfirmedById;
