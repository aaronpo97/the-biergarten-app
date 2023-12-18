import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

/**
 * Sends a DELETE request to the server to delete a beer post with the given ID.
 *
 * @param id The ID of the beer post to delete.
 * @returns A Promise that resolves to the parsed API response.
 * @throws An error if the response fails or the API response is invalid.
 */
const deleteBeerPostRequest = async (id: string) => {
  const response = await fetch(`/api/beers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Could not successfully parse the response.');
  }

  return parsed;
};

export default deleteBeerPostRequest;
