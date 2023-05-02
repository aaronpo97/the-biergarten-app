// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerPost, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerImagesArgs {
  numberOfImages: number;
  joinData: { beerPosts: BeerPost[]; users: User[] };
}

interface BeerImageData {
  path: string;
  alt: string;
  caption: string;
  beerPostId: string;
  postedById: string;
  createdAt: Date;
}
const createNewBeerImages = async ({
  numberOfImages,
  joinData: { beerPosts, users },
}: CreateNewBeerImagesArgs) => {
  const prisma = DBClient.instance;
  const createdAt = faker.date.past(1);

  const beerImageData: BeerImageData[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const caption = faker.lorem.sentence();
    const alt = faker.lorem.sentence();

    beerImageData.push({
      path: 'https://picsum.photos/5000/5000',
      alt,
      caption,
      beerPostId: beerPost.id,
      postedById: user.id,
      createdAt,
    });
  }

  await prisma.beerImage.createMany({ data: beerImageData });
  return prisma.beerImage.findMany();
};

export default createNewBeerImages;
