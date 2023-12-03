import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import updateBeerStyleCommentById from '@/services/BeerStyleComment/updateBeerStyleCommentById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import { CommentRequest, EditCommentRequest } from '../requestTypes';

export const checkIfBeerStyleCommentOwner = async <
  CommentRequestType extends CommentRequest,
>(
  req: CommentRequestType,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const beerStyleComment = await DBClient.instance.beerStyleComment.findFirst({
    where: { id },
  });

  if (!beerStyleComment) {
    throw new ServerError('Beer style comment not found.', 404);
  }

  if (beerStyleComment.postedById !== user.id) {
    throw new ServerError(
      'You are not authorized to modify this beer style comment.',
      403,
    );
  }

  return next();
};

export const editBeerStyleComment = async (
  req: EditCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const updated = await updateBeerStyleCommentById({
    id: req.query.id,
    body: req.body,
  });

  return res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    statusCode: 200,
    payload: updated,
  });
};

export const deleteBeerStyleComment = async (
  req: CommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  await DBClient.instance.beerStyleComment.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
    statusCode: 200,
  });
};
