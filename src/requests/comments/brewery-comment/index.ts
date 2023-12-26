import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import {
  SendCreateBreweryPostCommentRequest,
  SendDeleteBreweryPostCommentRequest,
  SendEditBreweryPostCommentRequest,
} from './types';
/**
 * Sends an api request to edit a brewery comment.
 *
 * @param params - The parameters for the request.
 * @param params.breweryId - The id of the brewery the comment belongs to.
 * @param params.commentId - The id of the comment to edit.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 */
export const sendEditBreweryPostCommentRequest: SendEditBreweryPostCommentRequest =
  async ({ body: { content, rating }, breweryPostId, commentId }) => {
    const response = await fetch(
      `/api/breweries/${breweryPostId}/comments/${commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, rating }),
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();
    const parsed = APIResponseValidationSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    return parsed.data;
  };

/**
 * Sends an api request to delete a brewery comment.
 *
 * @param params - The parameters for the request.
 * @param params.breweryId - The id of the brewery the comment belongs to.
 * @param params.commentId - The id of the comment to delete.
 * @returns The JSON response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendDeleteBreweryPostCommentRequest: SendDeleteBreweryPostCommentRequest =
  async ({ breweryPostId, commentId }) => {
    const response = await fetch(
      `/api/breweries/${breweryPostId}/comments/${commentId}`,
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
      throw new Error(parsed.error.message);
    }

    return parsed.data;
  };
/**
 * Sends an api request to create a brewery comment.
 *
 * @param params - The parameters for the request.
 * @param params.body - The body of the request.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.breweryId - The id of the brewery the comment belongs to.
 * @returns The created comment.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendCreateBreweryCommentRequest: SendCreateBreweryPostCommentRequest =
  async ({ body: { content, rating }, breweryPostId }) => {
    const response = await fetch(`/api/breweries/${breweryPostId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, rating }),
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
