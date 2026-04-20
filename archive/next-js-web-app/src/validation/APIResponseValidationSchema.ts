import { z } from 'zod';

const APIResponseValidationSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  success: z.boolean(),
  payload: z.unknown(),
});

export default APIResponseValidationSchema;
