// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BreweryPost, BreweryImage, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateBreweryImagesArgs {
  numberOfImages: number;

  joinData: {
    breweryPosts: BreweryPost[];
    users: User[];
  };
}
const createNewBreweryImages = async ({
  numberOfImages,
  joinData: { breweryPosts, users },
}: CreateBreweryImagesArgs) => {
  const prisma = DBClient.instance;
  const createdAt = faker.date.past(1);
  const breweryImagesPromises: Promise<BreweryImage>[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    breweryImagesPromises.push(
      prisma.breweryImage.create({
        data: {
          path: 'https://picsum.photos/900/1600',
          alt: 'Placeholder brewery image.',
          caption: 'Placeholder brewery image caption.',
          breweryPost: { connect: { id: breweryPost.id } },
          postedBy: { connect: { id: user.id } },
          createdAt,
        },
      }),
    );
  }

  return Promise.all(breweryImagesPromises);
};

export default createNewBreweryImages;
