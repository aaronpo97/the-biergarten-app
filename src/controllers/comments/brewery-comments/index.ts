import ServerError from '@/config/util/ServerError';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';

import {
  getBreweryCommentById,
  createNewBreweryComment,
  getAllBreweryComments,
  deleteBreweryCommentByIdService,
  updateBreweryCommentById,
} from '@/services/comments/brewery-comment';

import {
  CommentRequest,
  EditAndCreateCommentRequest,
  GetAllCommentsRequest,
} from '../types';

export const checkIfBreweryCommentOwner = async <
  CommentRequestType extends CommentRequest,
>(
  req: CommentRequestType,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const comment = await getBreweryCommentById({ breweryCommentId: id });

  if (!comment) {
    throw new ServerError('Comment not found', 404);
  }

  if (comment.postedBy.id !== user.id) {
    throw new ServerError('You are not authorized to modify this comment', 403);
  }

  return next();
};

export const editBreweryPostComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const updated = updateBreweryCommentById({
    breweryCommentId: id,
    body: req.body,
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

  await deleteBreweryCommentByIdService({ breweryCommentId: id });

  res.status(200).json({
    success: true,
    message: 'Brewery comment deleted successfully',
    statusCode: 200,
  });
};

export const createComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const breweryPostId = req.query.id;

  const user = req.user!;

  const newBreweryComment = await createNewBreweryComment({
    body: req.body,
    breweryPostId,
    userId: user.id,
  });

  res.status(201).json({
    message: 'Brewery comment created successfully',
    statusCode: 201,
    payload: newBreweryComment,
    success: true,
  });
};

export const getAll = async (
  req: GetAllCommentsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const breweryPostId = req.query.id;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page_size, page_num } = req.query;

  const { comments, count } = await getAllBreweryComments({
    id: breweryPostId,
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Brewery comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};
