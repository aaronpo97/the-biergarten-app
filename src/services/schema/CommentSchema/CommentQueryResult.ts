import { z } from 'zod';

const CommentQueryResult = z.object({
  id: z.string().cuid(),
  content: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5),
  createdAt: z.coerce.date(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string().min(1).max(50),
    userAvatar: z
      .object({
        id: z.string().cuid(),
        path: z.string().url(),
        alt: z.string().min(1).max(50),
        caption: z.string().min(1).max(50),
      })
      .nullable(),
  }),
  updatedAt: z.coerce.date().nullable(),
});

export default CommentQueryResult;
