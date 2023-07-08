import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const BreweryCommentValidationSchemaWithId = CreateCommentValidationSchema.extend({
  breweryPostId: z.string(),
});

const sendCreateBreweryCommentRequest = async ({
  content,
  rating,
  breweryPostId,
}: z.infer<typeof BreweryCommentValidationSchemaWithId>) => {
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

export default sendCreateBreweryCommentRequest;
