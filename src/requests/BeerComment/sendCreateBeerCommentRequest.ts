import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const BeerCommentValidationSchemaWithId = CreateCommentValidationSchema.extend({
  beerPostId: z.string().cuid(),
});

const sendCreateBeerCommentRequest = async ({
  beerPostId,
  content,
  rating,
}: z.infer<typeof BeerCommentValidationSchemaWithId>) => {
  const response = await fetch(`/api/beers/${beerPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ beerPostId, content, rating }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  const parsedResponse = APIResponseValidationSchema.safeParse(data);

  if (!parsedResponse.success) {
    throw new Error('Invalid API response');
  }

  const parsedPayload = CommentQueryResult.safeParse(parsedResponse.data.payload);

  if (!parsedPayload.success) {
    throw new Error('Invalid API response payload');
  }

  return parsedPayload.data;
};

export default sendCreateBeerCommentRequest;
