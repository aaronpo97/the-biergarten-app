import { beerPostQueryResultSchema } from '@/services/BeerPost/schema/BeerPostQueryResult';
import CreateBeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendCreateBeerPostRequest = async (
  data: z.infer<typeof CreateBeerPostValidationSchema>,
) => {
  const response = await fetch('/api/beers/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response');
  }

  const { payload, success, message } = parsed.data;

  if (!success) {
    throw new Error(message);
  }

  const parsedPayload = beerPostQueryResultSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error('Invalid API response payload');
  }

  return parsedPayload.data;
};

export default sendCreateBeerPostRequest;
