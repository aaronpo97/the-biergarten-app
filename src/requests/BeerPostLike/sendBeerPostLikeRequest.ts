import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

/**
 * Sends a POST request to the server to like or unlike a beer post.
 *
 * @param beerPostId The ID of the beer post to like or unlike.
 * @returns An object containing a success boolean and a message string.
 * @throws An error if the response is not ok or if the API response is invalid.
 */
const sendBeerPostLikeRequest = async (beerPostId: string) => {
  const response = await fetch(`/api/beers/${beerPostId}/like`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Something went wrong.');
  }

  const data = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  const { success, message } = parsed.data;

  return { success, message };
};

export default sendBeerPostLikeRequest;
