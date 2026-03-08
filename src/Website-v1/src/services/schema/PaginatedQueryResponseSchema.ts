import { z } from 'zod';

const PaginatedQueryResponseSchema = z.object({
  page_num: z.string().regex(/^\d+$/),
  page_size: z.string().regex(/^\d+$/),
});

export default PaginatedQueryResponseSchema;
