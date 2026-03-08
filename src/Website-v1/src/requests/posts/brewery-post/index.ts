import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import {
  SendEditBreweryPostRequest,
  SendDeleteBreweryPostRequest,
  SendCreateBreweryPostRequest,
} from './types';

/**
 * Sends an api request to edit a brewery post.
 *
 * @param args - The arguments for the request.
 * @param args.body - The body of the request.
 * @param args.body.name - The name of the brewery.
 * @param args.body.description - The description of the brewery.
 * @param args.body.dateEstablished - The date the brewery was established.
 * @param args.breweryPostId - The id of the brewery post to edit.
 */
export const sendEditBreweryPostRequest: SendEditBreweryPostRequest = async ({
  body,
  breweryPostId,
}) => {
  const response = await fetch(`/api/breweries/${breweryPostId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Something went wrong');
  }

  return parsed.data;
};

/**
 * Sends an api request to delete a brewery post.
 *
 * @param args - The arguments for the request.
 * @param args.breweryPostId - The id of the brewery post to delete.
 */
export const sendDeleteBreweryPostRequest: SendDeleteBreweryPostRequest = async ({
  breweryPostId,
}) => {
  const response = await fetch(`/api/breweries/${breweryPostId}`, {
    method: 'DELETE',
  });

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
 * Sends an api request to create a brewery post.
 *
 * @param args - The arguments for the request.
 * @param args.body - The body of the request.
 * @param args.body.name - The name of the brewery.
 * @param args.body.description - The description of the brewery.
 * @param args.body.dateEstablished - The date the brewery was established.
 */
export const sendCreateBreweryPostRequest: SendCreateBreweryPostRequest = async ({
  body,
}) => {
  const response = await fetch('/api/breweries/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response parsing failed');
  }

  const parsedPayload = BreweryPostQueryResult.safeParse(parsed.data.payload);
  if (!parsedPayload.success) {
    throw new Error('API response payload parsing failed');
  }

  return parsedPayload.data;
};
