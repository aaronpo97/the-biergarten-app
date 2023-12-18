import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendBreweryPostLikeRequest = async (breweryPostId: string) => {
  const response = await fetch(`/api/breweries/${breweryPostId}/like`, {
    method: 'POST',
  });

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  return parsed.data;
};

export default sendBreweryPostLikeRequest;
