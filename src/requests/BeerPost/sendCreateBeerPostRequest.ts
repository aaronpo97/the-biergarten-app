import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import CreateBeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

/**
 * Sends a POST request to the server to create a new beer post.
 *
 * @param data Data containing the beer post information to be sent to the server.
 * @param abv The alcohol by volume of the beer.
 * @param breweryId The ID of the brewery that produces the beer.
 * @param description The description of the beer.
 * @param ibu The International Bitterness Units of the beer.
 * @param name The name of the beer.
 * @param styleId The ID of the beer style.
 * @returns A Promise that resolves to the created beer post.
 * @throws An error if the request fails, the API response is invalid, or the API response
 *   payload is invalid.
 */
const sendCreateBeerPostRequest = async ({
  abv,
  breweryId,
  description,
  ibu,
  name,
  styleId,
}: z.infer<typeof CreateBeerPostValidationSchema>) => {
  const response = await fetch('/api/beers/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      abv,
      breweryId,
      description,
      ibu,
      name,
      styleId,
    }),
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

export default sendCreateBeerPostRequest;
