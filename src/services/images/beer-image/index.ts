import DBClient from '@/prisma/DBClient';
import { BeerImage } from '@prisma/client';
import { cloudinary } from '@/config/cloudinary';
import {
  AddBeerImagesToDB,
  DeleteBeerImageFromDBAndStorage,
  UpdateBeerImageMetadata,
} from './types';

/**
 * Adds beer images to the database.
 *
 * @param options - The options for adding beer images.
 * @param options.body - The body of the request.
 * @param options.body.alt - The alt text for the beer image.
 * @param options.body.caption - The caption for the beer image.
 * @param options.files - The array of files to be uploaded as beer images.
 * @param options.beerPostId - The ID of the beer post.
 * @param options.userId - The ID of the user.
 * @returns A promise that resolves to an array of created beer images.
 */
export const addBeerImagesToDB: AddBeerImagesToDB = ({
  body,
  files,
  beerPostId,
  userId,
}) => {
  const beerImagePromises: Promise<BeerImage>[] = [];

  const { alt, caption } = body;
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

/**
 * Deletes a beer image from the database and storage.
 *
 * @param options - The options for deleting a beer image.
 * @param options.beerImageId - The ID of the beer image.
 */
export const deleteBeerImageFromDBAndStorage: DeleteBeerImageFromDBAndStorage = async ({
  beerImageId,
}) => {
  const deleted = await DBClient.instance.beerImage.delete({
    where: { id: beerImageId },
    select: { path: true, id: true },
  });
  const { path } = deleted;
  await cloudinary.uploader.destroy(path);
};

/**
 * Updates the beer image metadata in the database.
 *
 * @param options - The options for updating the beer image metadata.
 * @param options.beerImageId - The ID of the beer image.
 * @param options.body - The body of the request containing the alt and caption.
 * @param options.body.alt - The alt text for the beer image.
 * @param options.body.caption - The caption for the beer image.
 * @returns A promise that resolves to the updated beer image.
 */

export const updateBeerImageMetadata: UpdateBeerImageMetadata = async ({
  beerImageId,
  body,
}) => {
  const { alt, caption } = body;
  const updated = await DBClient.instance.beerImage.update({
    where: { id: beerImageId },
    data: { alt, caption },
  });

  return updated;
};
