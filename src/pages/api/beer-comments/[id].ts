import { UserExtendedNextApiRequest } from '@/config/auth/types';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter, NextHandler } from 'next-connect';
import { z } from 'zod';

interface DeleteCommentRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

interface EditCommentRequest extends UserExtendedNextApiRequest {
  query: { id: string };
  body: z.infer<typeof CreateCommentValidationSchema>;
}

const checkIfCommentOwner = async (
  req: DeleteCommentRequest | EditCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
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
    throw new ServerError('You are not authorized to modify this comment', 403);
  }

  await next();
};

const editComment = async (
  req: EditCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const updated = await DBClient.instance.beerComment.update({
    where: { id },
    data: {
      content: req.body.content,
      rating: req.body.rating,
      updatedAt: new Date(),
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    statusCode: 200,
    payload: updated,
  });
};

const deleteComment = async (
  req: DeleteCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

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

router
  .delete(
    validateRequest({ querySchema: z.object({ id: z.string().uuid() }) }),
    getCurrentUser,
    checkIfCommentOwner,
    deleteComment,
  )
  .put(
    validateRequest({
      querySchema: z.object({ id: z.string().uuid() }),
      bodySchema: CreateCommentValidationSchema,
    }),
    getCurrentUser,
    checkIfCommentOwner,
    editComment,
  );

const handler = router.handler(NextConnectOptions);
export default handler;
