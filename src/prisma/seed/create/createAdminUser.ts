import { z } from 'zod';

import { hashPassword } from '../../../config/auth/passwordFns';
import DBClient from '../../DBClient';
import GetUserSchema from '../../../services/User/schema/GetUserSchema';

const createAdminUser = async () => {
  const hash = await hashPassword('Pas!3word');
  const adminUser: z.infer<typeof GetUserSchema> = await DBClient.instance.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'ADMIN',
      hash,
    },
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

  return adminUser;
};

export default createAdminUser;
