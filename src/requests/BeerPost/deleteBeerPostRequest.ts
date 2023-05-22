import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

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
