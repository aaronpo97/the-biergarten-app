/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import generator from 'generate-password';

import crypto from 'crypto';
import DBClient from '../../DBClient';
import { hashPassword } from '../../../config/auth/passwordFns';
import logger from '../../../config/pino/logger';

interface CreateNewUsersArgs {
  numberOfUsers: number;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dateOfBirth: Date;
  createdAt: Date;
  hash: string;
  accountIsVerified: boolean;
  role: 'USER' | 'ADMIN';
  bio: string;
}

const createNewUsers = async ({ numberOfUsers }: CreateNewUsersArgs) => {
  const prisma = DBClient.instance;
  await DBClient.instance.$disconnect();

  const passwords = Array.from({ length: numberOfUsers }, () =>
    generator.generate({
      length: 20,
      symbols: true,
      numbers: true,
      uppercase: true,
      strict: true,
    }),
  );

  logger.info('Hashing passwords. This may take a while...');
  const hashedPasswords = await Promise.all(
    passwords.map((password) => hashPassword(password)),
  );

  logger.info('Creating new users. This may take a while...');

  const data: UserData[] = [];

  const takenUsernames: string[] = [];
  const takenEmails: string[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfUsers; i++) {
    const randomValue = crypto.randomBytes(1).toString('hex');
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName[0]}.${lastName}.${randomValue}`.toLowerCase();
    const email = faker.internet
      .email({ firstName, lastName, provider: 'example.com' })
      .toLowerCase();

    const hash = hashedPasswords[i];
    const userAvailable =
      !takenUsernames.includes(username) && !takenEmails.includes(email);

    if (!userAvailable) {
      i -= 1;

      // eslint-disable-next-line no-continue
      continue;
    }
    takenUsernames.push(username);
    takenEmails.push(email);

    const dateOfBirth = faker.date.birthdate({ mode: 'age', min: 19 });
    const createdAt = faker.date.past({ years: 4 });
    const bio = faker.lorem.paragraphs(3).replace(/\n/g, ' ');

    const user: UserData = {
      firstName,
      lastName,
      email,
      username,
      dateOfBirth,
      createdAt,
      hash,
      bio,
      accountIsVerified: true,
      role: 'USER',
    };

    data.push(user);
  }

  await prisma.user.createMany({ data, skipDuplicates: true });
  return prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
  });
};

export default createNewUsers;
