// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import DBClient from '../../DBClient';

interface CreateNewUsersArgs {
  numberOfUsers: number;
}

const createNewUsers = async ({ numberOfUsers }: CreateNewUsersArgs) => {
  const prisma = DBClient.instance;
  const userPromises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfUsers; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const username = `${firstName[0]}.${lastName}`;
    const email = faker.internet.email(firstName, lastName, 'example.com');
    const dateOfBirth = faker.date.birthdate({ mode: 'age', min: 19 });

    userPromises.push(
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          dateOfBirth,
        },
      }),
    );
  }
  return Promise.all(userPromises);
};

export default createNewUsers;
