import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import getBreweryCommentById from '@/services/BreweryComment/getBreweryCommentById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import { CommentRequest, EditCommentRequest } from '../requestTypes';

export const checkIfBreweryCommentOwner = async <
  CommentRequestType extends CommentRequest,
>(
  req: CommentRequestType,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const comment = await getBreweryCommentById(id);

  if (!comment) {
    throw new ServerError('Comment not found', 404);
  }

  if (comment.postedById !== user.id) {
    throw new ServerError('You are not authorized to modify this comment', 403);
  }

  return next();
};

export const editBreweryPostComment = async (
  req: EditCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const updated = await DBClient.instance.breweryComment.update({
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

export const deleteBreweryPostComment = async (
  req: CommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  await DBClient.instance.breweryComment.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
    statusCode: 200,
  });
};
