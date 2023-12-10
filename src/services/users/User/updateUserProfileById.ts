import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import GetUserSchema from './schema/GetUserSchema';

interface UpdateUserProfileByIdParams {
  id: string;
  data: { bio: string };
}

const updateUserProfileById = async ({ id, data }: UpdateUserProfileByIdParams) => {
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: { bio: data.bio },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      userAvatar: true,
      accountIsVerified: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      updatedAt: true,
      dateOfBirth: true,
      role: true,
    },
  });

  return user;
};

export default updateUserProfileById;
