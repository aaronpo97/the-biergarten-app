import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';
import { z } from 'zod';

interface SendUploadBeerImagesRequestArgs {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
  images: FileList;
}

const sendUploadBreweryImagesRequest = async ({
  breweryPost,
  images,
}: SendUploadBeerImagesRequestArgs) => {
  const formData = new FormData();

  [...images].forEach((file) => {
    formData.append('images', file);
  });

  formData.append('caption', `Image of ${breweryPost.name}`);
  formData.append('alt', breweryPost.name);

  const uploadResponse = await fetch(`/api/breweries/${breweryPost.id}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload images');
  }

  return uploadResponse.json();
};

export default sendUploadBreweryImagesRequest;
