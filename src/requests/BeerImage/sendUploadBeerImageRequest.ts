import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

interface SendUploadBeerImagesRequestArgs {
  beerPost: z.infer<typeof beerPostQueryResult>;
  images: FileList;
}

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

  return uploadResponse.json();
};

export default sendUploadBeerImagesRequest;
