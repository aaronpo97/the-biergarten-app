import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';

import ServerError from '@/config/util/ServerError';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import {
  getBeerPostCommentByIdService,
  editBeerPostCommentByIdService,
  createBeerPostCommentService,
  getAllBeerCommentsService,
  deleteBeerCommentByIdService,
  getBeerPostCommentCountService,
} from '@/services/comments/beer-comment';

import {
  CommentRequest,
  EditAndCreateCommentRequest,
  GetAllCommentsRequest,
} from '../types';

export const checkIfBeerCommentOwner = async <T extends CommentRequest>(
  req: T,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const comment = await getBeerPostCommentByIdService({ beerPostCommentId: id });

  if (!comment) {
    throw new ServerError('Comment not found', 404);
  }

  if (comment.postedBy.id !== user.id) {
    throw new ServerError('You are not authorized to modify this comment', 403);
  }

  return next();
};

export const editBeerPostComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  await editBeerPostCommentByIdService({ body: req.body, beerPostCommentId: id });

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    statusCode: 200,
  });
};

export const deleteBeerPostComment = async (
  req: CommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  await deleteBeerCommentByIdService({ beerPostCommentId: id });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
    statusCode: 200,
  });
};

export const createBeerPostComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const beerPostId = req.query.id;

  const newBeerComment = await createBeerPostCommentService({
    body: req.body,
    userId: req.user!.id,
    beerPostId,
  });

  res.status(201).json({
    message: 'Beer comment created successfully',
    statusCode: 201,
    payload: newBeerComment,
    success: true,
  });
};

export const getAllBeerPostComments = async (
  req: GetAllCommentsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const beerPostId = req.query.id;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num } = req.query;

  const comments = await getAllBeerCommentsService({
    beerPostId,
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
  });

  const count = await getBeerPostCommentCountService({ beerPostId });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beer comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};
