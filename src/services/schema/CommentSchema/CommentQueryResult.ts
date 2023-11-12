import { z } from 'zod';
import ImageQueryValidationSchema from '../ImageSchema/ImageQueryValidationSchema';

const CommentQueryResult = z.object({
  id: z.string().cuid(),
  content: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string().min(1).max(50),
    userAvatar: ImageQueryValidationSchema.nullable(),
  }),
});

export default CommentQueryResult;
