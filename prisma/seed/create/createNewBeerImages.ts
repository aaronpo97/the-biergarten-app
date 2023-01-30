// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerPost, BeerImage } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerImagesArgs {
  numberOfImages: number;
  beerPosts: BeerPost[];
}
const createNewBeerImages = async ({
  numberOfImages,
  beerPosts,
}: CreateNewBeerImagesArgs) => {
  const prisma = DBClient.instance;
  const createdAt = faker.date.past(1);
  const beerImagesPromises: Promise<BeerImage>[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    beerImagesPromises.push(
      prisma.beerImage.create({
        data: {
          url: 'https://picsum.photos/900/1600',
          alt: 'Placeholder beer image.',
          beerPost: { connect: { id: beerPost.id } },
          createdAt,
        },
      }),
    );
  }

  return Promise.all(beerImagesPromises);
};

export default createNewBeerImages;
