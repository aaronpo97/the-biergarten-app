import DBClient from '@/prisma/DBClient';
import { BreweryImage } from '@prisma/client';
import { z } from 'zod';
import ImageMetadataValidationSchema from '../types/ImageSchema/ImageMetadataValidationSchema';

interface ProcessImageDataArgs {
  files: Express.Multer.File[];
  alt: z.infer<typeof ImageMetadataValidationSchema>['alt'];
  caption: z.infer<typeof ImageMetadataValidationSchema>['caption'];
  breweryPostId: string;
  userId: string;
}

const addBreweryImageToDB = ({
  alt,
  caption,
  files,
  breweryPostId,
  userId,
}: ProcessImageDataArgs) => {
  const breweryImagePromises: Promise<BreweryImage>[] = [];
  files.forEach((file) => {
    breweryImagePromises.push(
      DBClient.instance.breweryImage.create({
        data: {
          alt,
          caption,
          postedBy: { connect: { id: userId } },
          breweryPost: { connect: { id: breweryPostId } },
          path: file.path,
        },
      }),
    );
  });

  return Promise.all(breweryImagePromises);
};

export default addBreweryImageToDB;
