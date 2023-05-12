import { hashPassword } from '@/config/auth/passwordFns';
import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateUserValidationSchema from './schema/CreateUserValidationSchema';
import GetUserSchema from './schema/GetUserSchema';

const createNewUser = async ({
  email,
  password,
  firstName,
  lastName,
  dateOfBirth,
  username,
}: z.infer<typeof CreateUserValidationSchema>) => {
  const hash = await hashPassword(password);
  const user: z.infer<typeof GetUserSchema> = await DBClient.instance.user.create({
    data: {
      username,
      email,
      hash,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
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
    },
  });

  return user;
};

export default createNewUser;
