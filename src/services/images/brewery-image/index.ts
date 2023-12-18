import DBClient from '@/prisma/DBClient';
import { BreweryImage } from '@prisma/client';
import { cloudinary } from '@/config/cloudinary';
import {
  AddBreweryImagesToDB,
  DeleteBreweryImageFromDBAndStorage,
  UpdateBreweryImageMetadata,
} from './types';

/**
 * Adds brewery images to the database.
 *
 * @param options - The options for adding brewery images.
 * @param options.body - The body of the request containing the alt and caption.
 * @param options.body.alt - The alt text for the brewery image.
 * @param options.body.caption - The caption for the brewery image.
 * @param options.files - The array of files to be uploaded as brewery images.
 * @param options.breweryPostId - The ID of the brewery post.
 * @param options.userId - The ID of the user adding the images.
 * @returns A promise that resolves to an array of created brewery images.
 */

export const addBreweryImagesService: AddBreweryImagesToDB = ({
  body,
  files,
  breweryPostId,
  userId,
}) => {
  const breweryImagePromises: Promise<BreweryImage>[] = [];

  const { alt, caption } = body;
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

/**
 * Deletes a brewery image from the database and storage.
 *
 * @param options - The options for deleting a brewery image.
 * @param options.breweryImageId - The ID of the brewery image.
 */
export const deleteBreweryImageService: DeleteBreweryImageFromDBAndStorage = async ({
  breweryImageId,
}) => {
  const deleted = await DBClient.instance.breweryImage.delete({
    where: { id: breweryImageId },
    select: { path: true, id: true },
  });
  const { path } = deleted;
  await cloudinary.uploader.destroy(path);
};

/**
 * Updates the brewery image metadata in the database.
 *
 * @param options - The options for updating the brewery image metadata.
 * @param options.breweryImageId - The ID of the brewery image.
 * @param options.body - The body of the request containing the alt and caption.
 * @param options.body.alt - The alt text for the brewery image.
 * @param options.body.caption - The caption for the brewery image.
 * @returns A promise that resolves to the updated brewery image.
 */
export const updateBreweryImageService: UpdateBreweryImageMetadata = async ({
  breweryImageId,
  body,
}) => {
  const { alt, caption } = body;
  const updated = await DBClient.instance.breweryImage.update({
    where: { id: breweryImageId },
    data: { alt, caption },
  });

  return updated;
};
