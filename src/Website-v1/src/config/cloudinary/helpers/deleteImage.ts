import { cloudinary } from '..';

/**
 * Deletes an image from Cloudinary.
 *
 * @param path - The cloudinary path of the image to be deleted.
 * @returns A promise that resolves when the image is successfully deleted.
 */
const deleteImage = (path: string) => cloudinary.uploader.destroy(path);

export default deleteImage;
