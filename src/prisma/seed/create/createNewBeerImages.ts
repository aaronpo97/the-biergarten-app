// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerPost, BeerImage, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerImagesArgs {
  numberOfImages: number;
  joinData: { beerPosts: BeerPost[]; users: User[] };
}

const createNewBeerImages = async ({
  numberOfImages,
  joinData: { beerPosts, users },
}: CreateNewBeerImagesArgs) => {
  const prisma = DBClient.instance;
  const createdAt = faker.date.past(1);
  const beerImagesPromises: Promise<BeerImage>[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const caption = faker.lorem.sentence();
    const alt = faker.lorem.sentence();

    beerImagesPromises.push(
      prisma.beerImage.create({
        data: {
          path: 'https://picsum.photos/5000/5000',
          alt,
          caption,
          beerPost: { connect: { id: beerPost.id } },
          postedBy: { connect: { id: user.id } },
          createdAt,
        },
      }),
    );
  }

  return Promise.all(beerImagesPromises);
};

export default createNewBeerImages;
