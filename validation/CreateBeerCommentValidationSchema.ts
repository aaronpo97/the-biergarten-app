import { z } from 'zod';

const BeerCommentValidationSchema = z.object({
  content: z
    .string()
    .min(1, {
      message: 'Comment must not be empty.',
    })
    .max(300, {
      message: 'Comment must be less than 300 characters.',
    }),
  rating: z
    .number()
    .int()
    .min(1, { message: 'Rating must be greater than 1.' })
    .max(5, { message: 'Rating must be less than 5.' }),
  beerPostId: z.string().uuid({
    message: 'Beer post ID must be a valid UUID.',
  }),
});

export default BeerCommentValidationSchema;
