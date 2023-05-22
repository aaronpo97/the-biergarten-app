import EditBeerPostValidationSchema from '@/services/BeerPost/schema/EditBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

async function sendEditBeerPostRequest(
  data: z.infer<typeof EditBeerPostValidationSchema>,
) {
  const response = await fetch(`/api/beers/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('something went wrong');
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
}

export default sendEditBeerPostRequest;
