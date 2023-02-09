import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendCheckIfUserLikesBeerPostRequest = async (beerPostId: string) => {
  const response = await fetch(`/api/beers/${beerPostId}/like/is-liked`);
  const data = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  const { payload } = parsed.data;

  const parsedPayload = z
    .object({
      isLiked: z.boolean(),
    })
    .safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error('Invalid API response.');
  }

  const { isLiked } = parsedPayload.data;

  return isLiked;
};

export default sendCheckIfUserLikesBeerPostRequest;
