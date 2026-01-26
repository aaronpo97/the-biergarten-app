import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

interface SendUploadBeerImagesRequestArgs {
  beerPost: z.infer<typeof BeerPostQueryResult>;
  images: FileList;
}

/**
 * Sends a POST request to the server to upload images for a beer post.
 *
 * @param beerPost The beer post object.
 * @param images The list of images to upload.
 * @returns A promise that resolves to the response from the server.
 * @throws An error if the upload fails or the API response is invalid.
 */

const sendUploadBeerImagesRequest = async ({
  beerPost,
  images,
}: SendUploadBeerImagesRequestArgs) => {
  const formData = new FormData();

  [...images].forEach((file) => {
    formData.append('images', file);
  });

  formData.append('caption', `Image of ${beerPost.name}`);
  formData.append('alt', beerPost.name);

  const uploadResponse = await fetch(`/api/beers/${beerPost.id}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload images');
  }

  const json = await uploadResponse.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response');
  }

  return parsed.data;
};

export default sendUploadBeerImagesRequest;
