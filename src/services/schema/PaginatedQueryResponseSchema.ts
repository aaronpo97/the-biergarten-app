import { z } from 'zod';

const PaginatedQueryResponseSchema = z.object({
  page_num: z.string(),
  page_size: z.string(),
});

export default PaginatedQueryResponseSchema;
