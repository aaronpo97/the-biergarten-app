import { BreweryPost, BreweryImage } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateBreweryImagesArgs {
  numberOfImages: number;
  breweryPosts: BreweryPost[];
}
const createNewBreweryImages = async ({
  numberOfImages,
  breweryPosts,
}: CreateBreweryImagesArgs) => {
  const prisma = DBClient.instance;

  const breweryImagesPromises: Promise<BreweryImage>[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfImages; i++) {
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];

    breweryImagesPromises.push(
      prisma.breweryImage.create({
        data: {
          url: 'https://picsum.photos/900/1600',
          breweryPost: { connect: { id: breweryPost.id } },
        },
      }),
    );
  }

  return Promise.all(breweryImagesPromises);
};

export default createNewBreweryImages;
