import BeerPostValidationSchema from '@/validation/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendCreateBeerPostRequest = async (
  data: z.infer<typeof BeerPostValidationSchema>,
) => {
  const response = await fetch('/api/beers/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response');
  }

  const { payload } = parsed.data;

  if (
    !(
      payload &&
      typeof payload === 'object' &&
      'id' in payload &&
      typeof payload.id === 'string'
    )
  ) {
    throw new Error('Invalid API response');
  }

  return payload;
};

export default sendCreateBeerPostRequest;
