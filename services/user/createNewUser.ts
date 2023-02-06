import findUserByUsername from '@/services/user/findUserByUsername';
import { hashPassword } from '@/config/auth/passwordFns';
import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import CreateUserValidationSchema from './schema/CreateUserValidationSchema';

const createNewUser = async ({
  email,
  password,
  firstName,
  lastName,
  dateOfBirth,
  username,
}: z.infer<typeof CreateUserValidationSchema>) => {
  const userExists = await findUserByUsername(username);

  if (userExists) {
    throw new ServerError(
      "Could not register a user with that username as it's already taken.",
      409,
    );
  }

  const hash = await hashPassword(password);
  const user = DBClient.instance.user.create({
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
    },
  });

  return user;
};

export default createNewUser;
