import DBClient from '@/prisma/DBClient';
import { z } from 'zod';

import PublicUserSchema from './schema/PublicUserSchema';

const findUserByIdPublic = async (id: string) => {
  const user: z.infer<typeof PublicUserSchema> | null =
    await DBClient.instance.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: true,
      },
    });

  return user;
};

export default findUserByIdPublic;
