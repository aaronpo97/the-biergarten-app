import ServerError from '@/config/util/ServerError';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';

import {
  updateBeerStyleCommentById,
  createNewBeerStyleComment,
  getAllBeerStyleComments,
  findBeerStyleCommentById,
  deleteBeerStyleCommentById,
} from '@/services/comments/beer-style-comment';

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
  const { commentId } = req.query;
  const user = req.user!;

  const beerStyleComment = await findBeerStyleCommentById({
    beerStyleCommentId: commentId,
  });

  if (!beerStyleComment) {
    throw new ServerError('Beer style comment not found.', 404);
  }

  if (beerStyleComment.postedBy.id !== user.id) {
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
  await updateBeerStyleCommentById({
    beerStyleCommentId: req.query.commentId,
    body: req.body,
  });

  return res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    statusCode: 200,
  });
};

export const deleteBeerStyleComment = async (
  req: CommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { commentId } = req.query;

  await deleteBeerStyleCommentById({ beerStyleCommentId: commentId });

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
  const newBeerStyleComment = await createNewBeerStyleComment({
    body: req.body,
    beerStyleId: req.query.postId,
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
  const beerStyleId = req.query.postId;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num } = req.query;

  const { comments, count } = await getAllBeerStyleComments({
    beerStyleId,
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beer comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};
