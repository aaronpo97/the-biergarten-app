import { z } from 'zod';

const CreateCommentValidationSchema = z.object({
  userId: z.string().uuid(),
  beerPostId: z.string().uuid(),
});

export default CreateCommentValidationSchema;
