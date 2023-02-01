import { BeerCommentQueryResult } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendCreateBeerCommentRequest = async ({
  beerPostId,
  content,
  rating,
}: z.infer<typeof BeerCommentValidationSchema>) => {
  const response = await fetch(`/api/beers/${beerPostId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      beerPostId,
      content,
      rating,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const parsedResponse = APIResponseValidationSchema.safeParse(data);

  if (!parsedResponse.success) {
    console.log(parsedResponse.error);
    throw new Error('Invalid API response');
  }

  console.log(parsedResponse);
  const parsedPayload = BeerCommentQueryResult.safeParse(parsedResponse.data.payload);

  if (!parsedPayload.success) {
    console.log(parsedPayload.error);
    throw new Error('Invalid API response payload');
  }

  return parsedPayload.data;
};

export default sendCreateBeerCommentRequest;
