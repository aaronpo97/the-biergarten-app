import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import {
  SendCreateBeerPostRequest,
  SendDeleteBeerPostRequest,
  SendEditBeerPostRequest,
} from './types';

/**
 * Sends a POST request to create a new beer post.
 *
 * @example
 *   const beerPost = await sendCreateBeerPostRequest({
 *     body: {
 *       abv: 5.5,
 *       description: 'A golden delight with a touch of citrus.',
 *       ibu: 30,
 *       name: 'Yerb Sunshine Ale',
 *     },
 *     styleId: 'clqmteqxc000008jphoy31wqw',
 *     breweryId: 'clqmtexfb000108jp3nsg26c6',
 *   });
 *
 * @param data - The data to send in the request.
 * @param data.body - The body of the request.
 * @param data.body.abv - The ABV of the beer.
 * @param data.body.description - The description of the beer.
 * @param data.body.ibu - The IBU of the beer.
 * @param data.body.name - The name of the beer.
 * @param data.styleId - The ID of the style of the beer.
 * @param data.breweryId - The ID of the brewery of the beer.
 * @returns The created beer post.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendCreateBeerPostRequest: SendCreateBeerPostRequest = async ({
  body: { abv, description, ibu, name },
  styleId,
  breweryId,
}) => {
  const response = await fetch('/api/beers/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ abv, description, ibu, name, styleId, breweryId }),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Invalid API response');
  }
  const { payload, success, message } = parsed.data;
  if (!success) {
    throw new Error(message);
  }
  const parsedPayload = BeerPostQueryResult.safeParse(payload);
  if (!parsedPayload.success) {
    throw new Error('Invalid API response payload');
  }
  return parsedPayload.data;
};

/**
 * Sends a DELETE request to delete a beer post.
 *
 * @example
 *   const response = await sendDeleteBeerPostRequest({
 *     beerPostId: 'clqmtexfb000108jp3nsg26c6',
 *   });
 *
 * @param args - The arguments to send in the request.
 * @param args.beerPostId - The ID of the beer post to delete.
 * @returns The response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendDeleteBeerPostRequest: SendDeleteBeerPostRequest = async ({
  beerPostId,
}) => {
  const response = await fetch(`/api/beers/${beerPostId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Could not successfully parse the response.');
  }
  return parsed.data;
};

/**
 * Sends a PUT request to edit a beer post.
 *
 * @example
 *   const response = await sendEditBeerPostRequest({
 *     beerPostId: 'clqmtexfb000108jp3nsg26c6',
 *     body: {
 *       abv: 5.5,
 *       description: 'A golden delight with a touch of citrus.',
 *       ibu: 30,
 *       name: 'Yerb Sunshine Ale',
 *     },
 *   });
 *
 * @param args - The arguments to send in the request.
 * @param args.beerPostId - The ID of the beer post to edit.
 * @param args.body - The body of the request.
 * @param args.body.abv - The ABV of the beer.
 * @param args.body.description - The description of the beer.
 * @param args.body.ibu - The IBU of the beer.
 * @param args.body.name - The name of the beer.
 * @returns The response from the server.
 * @throws An error if the request fails or the response is invalid.
 */
export const sendEditBeerPostRequest: SendEditBeerPostRequest = async ({
  beerPostId,
  body: { abv, description, ibu, name },
}) => {
  const response = await fetch(`/api/beers/${beerPostId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ abv, description, ibu, name }),
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
