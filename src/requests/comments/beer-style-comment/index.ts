import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import {
  SendCreateBeerStyleCommentRequest,
  SendDeleteBeerStyleCommentRequest,
  SendEditBeerStyleCommentRequest,
} from './types';

/**
 * Sends an api request to edit a beer style comment.
 *
 * @param params - The parameters for the request.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.beerStyleId - The id of the beer style the comment belongs to.
 * @param params.commentId - The id of the comment to edit.
 * @returns The JSON response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendEditBeerStyleCommentRequest: SendEditBeerStyleCommentRequest = async ({
  commentId,
  body: { content, rating },
  beerStyleId,
}) => {
  const response = await fetch(`/api/beers/styles/${beerStyleId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response');
  }

  return parsed.data;
};

/**
 * Sends an api request to delete a beer style comment.
 *
 * @param params - The parameters for the request.
 * @param params.beerStyleId - The id of the beer style the comment belongs to.
 * @param params.commentId - The id of the comment to delete.
 * @returns The json response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendDeleteBeerStyleCommentRequest: SendDeleteBeerStyleCommentRequest =
  async ({ beerStyleId, commentId }) => {
    const response = await fetch(
      `/api/beers/styles/${beerStyleId}/comments/${commentId}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();

    const parsed = APIResponseValidationSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error('Invalid API response');
    }

    return parsed.data;
  };

/**
 * Sends an api request to create a beer style comment.
 *
 * @param params - The parameters for the request.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.beerStyleId - The id of the beer style the comment belongs to.
 * @returns The created comment.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendCreateBeerStyleCommentRequest: SendCreateBeerStyleCommentRequest =
  async ({ beerStyleId, body: { content, rating } }) => {
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
