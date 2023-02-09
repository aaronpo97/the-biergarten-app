import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendLikeRequest = async (beerPost: BeerPostQueryResult) => {
  const response = await fetch(`/api/beers/${beerPost.id}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
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

export default sendLikeRequest;
