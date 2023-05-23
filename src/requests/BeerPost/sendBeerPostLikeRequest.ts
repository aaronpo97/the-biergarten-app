import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendBeerPostLikeRequest = async (beerPostId: string) => {
  const response = await fetch(`/api/beers/${beerPostId}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Something went wrong.');
  }

  const data = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  const { success, message } = parsed.data;

  return { success, message };
};

export default sendBeerPostLikeRequest;
