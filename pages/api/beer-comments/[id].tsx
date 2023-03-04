import { UserExtendedNextApiRequest } from '@/config/auth/types';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface DeleteCommentRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

const deleteComment = async (
  req: DeleteCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;
  const user = req.user!;

  const comment = await DBClient.instance.beerComment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new ServerError('Comment not found', 404);
  }

  if (comment.postedById !== user.id) {
    throw new ServerError('You are not authorized to delete this comment', 403);
  }

  await DBClient.instance.beerComment.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
    statusCode: 200,
  });
};

const router = createRouter<
  DeleteCommentRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.delete(
  validateRequest({
    querySchema: z.object({ id: z.string().uuid() }),
  }),
  getCurrentUser,
  deleteComment,
);

const handler = router.handler(NextConnectOptions);
export default handler;
