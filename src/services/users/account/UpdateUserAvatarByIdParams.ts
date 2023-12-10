import DBClient from '@/prisma/DBClient';
import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { z } from 'zod';

export interface UpdateUserAvatarByIdParams {
  id: string;
  data: {
    avatar: {
      alt: string;
      path: string;
      caption: string;
    };
  };
}
const updateUserAvatarById = async ({ id, data }: UpdateUserAvatarByIdParams) => {
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.update({
    where: { id },
    data: {
      userAvatar: data.avatar
        ? {
            upsert: {
              create: {
                alt: data.avatar.alt,
                path: data.avatar.path,
                caption: data.avatar.caption,
              },
              update: {
                alt: data.avatar.alt,
                path: data.avatar.path,
                caption: data.avatar.caption,
              },
            },
          }
        : undefined,
    },
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

export default updateUserAvatarById;
