import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import {
  SendCreateBeerCommentRequest,
  SendDeleteBeerPostCommentRequest,
  SendEditBeerPostCommentRequest,
} from './types';

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

export const sendCreateBeerCommentRequest: SendCreateBeerCommentRequest = async ({
  beerPostId,
  body,
}) => {
  const { content, rating } = body;
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
