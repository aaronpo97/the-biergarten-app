import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import {
  SendCreateBeerCommentRequest,
  SendDeleteBeerPostCommentRequest,
  SendEditBeerPostCommentRequest,
} from './types';

/**
 * Sends an api request to edit a beer post comment.
 *
 * @param params - The parameters for the request.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.commentId - The id of the comment to edit.
 * @param params.beerPostId - The id of the beer post the comment belongs to.
 * @returns The JSON response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const editBeerPostCommentRequest: SendEditBeerPostCommentRequest = async ({
  body,
  commentId,
  beerPostId,
}) => {
  const response = await fetch(`/api/beers/${beerPostId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to edit comment');
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
};

/**
 * Sends an api request to delete a beer post comment.
 *
 * @param params - The parameters for the request.
 * @param params.commentId - The id of the comment to delete.
 * @param params.beerPostId - The id of the beer post the comment belongs to.
 * @returns The JSON response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const deleteBeerPostCommentRequest: SendDeleteBeerPostCommentRequest = async ({
  commentId,
  beerPostId,
}) => {
  const response = await fetch(`/api/beers/${beerPostId}/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
};

/**
 * Send an api request to create a comment on a beer post.
 *
 * @param params - The parameters for the request.
 * @param params.beerPostId - The id of the beer post to create the comment on.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @returns The created comment.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendCreateBeerCommentRequest: SendCreateBeerCommentRequest = async ({
  beerPostId,
  body: { content, rating },
}) => {
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
