import EditBeerPostValidationSchema from '@/services/BeerPost/schema/EditBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

/**
 * Sends a PUT request to the server to update a beer post.
 *
 * @param data Data containing the updated beer post information to be sent to the server.
 * @param data.abv The updated ABV of the beer.
 * @param data.description The updated description of the beer.
 * @param data.ibu The updated IBU of the beer.
 * @param data.id The ID of the beer post to be updated.
 * @param data.name The updated name of the beer.
 * @param data.styleId The updated style ID of the beer.
 * @throws If the response status is not ok or the API response is not successful.
 */
const sendEditBeerPostRequest = async ({
  abv,
  description,
  ibu,
  id,
  name,
  styleId,
}: z.infer<typeof EditBeerPostValidationSchema>) => {
  const response = await fetch(`/api/beers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ abv, description, ibu, name, styleId, id }),
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
};

export default sendEditBeerPostRequest;
