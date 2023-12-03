import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import editBeerCommentById from '@/services/BeerComment/editBeerCommentById';
import findBeerCommentById from '@/services/BeerComment/findBeerCommentById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import { CommentRequest, EditCommentRequest } from '../requestTypes';

export const checkIfBeerCommentOwner = async <T extends CommentRequest>(
  req: T,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const comment = await findBeerCommentById({ beerCommentId: id });

  if (!comment) {
    throw new ServerError('Comment not found', 404);
  }

  if (comment.postedBy.id !== user.id) {
    throw new ServerError('You are not authorized to modify this comment', 403);
  }

  return next();
};

export const editBeerPostComment = async (
  req: EditCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const updated = await editBeerCommentById({
    content: req.body.content,
    rating: req.body.rating,
    id,
  });

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    statusCode: 200,
    payload: updated,
  });
};

export const deleteBeerPostComment = async (
  req: CommentRequest,
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
