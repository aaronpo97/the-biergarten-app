import DBClient from '@/prisma/DBClient';
import { BeerImage } from '@prisma/client';
import { z } from 'zod';
import ImageMetadataValidationSchema from '../schema/ImageSchema/ImageMetadataValidationSchema';

interface ProcessImageDataArgs {
  files: Express.Multer.File[];
  alt: z.infer<typeof ImageMetadataValidationSchema>['alt'];
  caption: z.infer<typeof ImageMetadataValidationSchema>['caption'];
  beerPostId: string;
  userId: string;
}

const addBeerImageToDB = ({
  alt,
  caption,
  files,
  beerPostId,
  userId,
}: ProcessImageDataArgs) => {
  const beerImagePromises: Promise<BeerImage>[] = [];
  files.forEach((file) => {
    beerImagePromises.push(
      DBClient.instance.beerImage.create({
        data: {
          alt,
          caption,
          postedBy: { connect: { id: userId } },
          beerPost: { connect: { id: beerPostId } },
          path: file.path,
        },
      }),
    );
  });

  return Promise.all(beerImagePromises);
};

export default addBeerImageToDB;
