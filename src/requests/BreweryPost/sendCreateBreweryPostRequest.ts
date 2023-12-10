import BreweryPostQueryResult from '@/services/posts/BreweryPost/schema/BreweryPostQueryResult';
import CreateBreweryPostSchema from '@/services/posts/BreweryPost/schema/CreateBreweryPostSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendCreateBreweryPostRequest = async (
  data: z.infer<typeof CreateBreweryPostSchema>,
) => {
  const response = await fetch('/api/breweries/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response parsing failed');
  }

  const parsedPayload = BreweryPostQueryResult.safeParse(parsed.data.payload);
  if (!parsedPayload.success) {
    throw new Error('API response payload parsing failed');
  }

  return parsedPayload.data;
};

export default sendCreateBreweryPostRequest;
