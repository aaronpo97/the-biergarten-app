import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const BeerStyleCommentValidationSchemaWithId = CreateCommentValidationSchema.extend({
  beerStyleId: z.string().cuid(),
});

/**
 * Sends a POST request to the server to create a new beer comment.
 *
 * @param data The data to be sent to the server.
 * @param data.beerPostId The ID of the beer post to comment on.
 * @param data.content The content of the comment.
 * @param data.rating The rating of the beer.
 * @returns A promise that resolves to the created comment.
 * @throws An error if the request fails, the API response is invalid, or the API response
 *   payload is invalid.
 */
const sendCreateBeerStyleCommentRequest = async ({
  beerStyleId,
  content,
  rating,
}: z.infer<typeof BeerStyleCommentValidationSchemaWithId>) => {
  const response = await fetch(`/api/beers/styles/${beerStyleId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ beerStyleId, content, rating }),
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

export default sendCreateBeerStyleCommentRequest;
