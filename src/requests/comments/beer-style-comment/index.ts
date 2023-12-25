import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import {
  SendCreateBeerStyleCommentRequest,
  SendDeleteBeerStyleCommentRequest,
  SendEditBeerStyleCommentRequest,
} from './types';

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
