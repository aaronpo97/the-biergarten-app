import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import updateBeerStyleCommentById from '@/services/comments/BeerStyleComment/updateBeerStyleCommentById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';

import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import createNewBeerStyleComment from '@/services/comments/BeerStyleComment/createNewBeerStyleComment';
import getAllBeerStyleComments from '@/services/comments/BeerStyleComment/getAllBeerStyleComments';

import {
  CommentRequest,
  EditAndCreateCommentRequest,
  GetAllCommentsRequest,
} from '../types';

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
  req: EditAndCreateCommentRequest,
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

export const createComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { content, rating } = req.body;

  const newBeerStyleComment: z.infer<typeof CommentQueryResult> =
    await createNewBeerStyleComment({
      content,
      rating,
      beerStyleId: req.query.id,
      userId: req.user!.id,
    });

  res.status(201).json({
    message: 'Beer comment created successfully',
    statusCode: 201,
    payload: newBeerStyleComment,
    success: true,
  });
};

export const getAll = async (
  req: GetAllCommentsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const beerStyleId = req.query.id;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num } = req.query;

  const comments = await getAllBeerStyleComments({
    beerStyleId,
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
  });

  const count = await DBClient.instance.beerStyleComment.count({
    where: { beerStyleId },
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beer comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};
