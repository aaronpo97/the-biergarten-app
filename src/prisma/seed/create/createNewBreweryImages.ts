// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BreweryPost, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateBreweryImagesArgs {
  numberOfImages: number;

  joinData: {
    breweryPosts: BreweryPost[];
    users: User[];
  };
}
interface BreweryImageData {
  path: string;
  alt: string;
  caption: string;
  breweryPostId: string;
  postedById: string;
  createdAt: Date;
}

const createNewBreweryImages = async ({
  numberOfImages,
  joinData: { breweryPosts, users },
}: CreateBreweryImagesArgs) => {
  const prisma = DBClient.instance;
  const createdAt = faker.date.past(1);
  const breweryImageData: BreweryImageData[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    breweryImageData.push({
      path: 'https://picsum.photos/5000/5000',
      alt: 'Placeholder brewery image.',
      caption: 'Placeholder brewery image caption.',
      breweryPostId: breweryPost.id,
      postedById: user.id,
      createdAt,
    });
  }

  await prisma.breweryImage.createMany({
    data: breweryImageData,
  });

  return prisma.breweryImage.findMany();
};
export default createNewBreweryImages;
