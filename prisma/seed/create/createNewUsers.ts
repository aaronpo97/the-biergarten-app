import argon2 from 'argon2';
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import DBClient from '../../DBClient';

interface CreateNewUsersArgs {
  numberOfUsers: number;
}

const createNewUsers = async ({ numberOfUsers }: CreateNewUsersArgs) => {
  const prisma = DBClient.instance;
  const userPromises = [];

  const hashedPasswords = await Promise.all(
    Array.from({ length: numberOfUsers }, () => argon2.hash(faker.internet.password())),
  );

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfUsers; i++) {
    const randomValue = crypto.randomBytes(10).toString('hex');
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = `${firstName[0]}.${lastName}.${randomValue}`;
    const email = faker.internet.email(firstName, randomValue, 'example.com');

    const hash = hashedPasswords[i];
    const dateOfBirth = faker.date.birthdate({ mode: 'age', min: 19 });
    const createdAt = faker.date.past(1);
    userPromises.push(
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          dateOfBirth,
          createdAt,
          hash,
        },
      }),
    );
  }
  return Promise.all(userPromises);
};

export default createNewUsers;
