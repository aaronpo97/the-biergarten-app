import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import getBreweryCommentById from '@/services/comments/brewery-comment/getBreweryCommentById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { z } from 'zod';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import createNewBreweryComment from '@/services/comments/brewery-comment/createNewBreweryComment';
import getAllBreweryComments from '@/services/comments/brewery-comment/getAllBreweryComments';
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
  req: EditAndCreateCommentRequest,
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

export const createComment = async (
  req: EditAndCreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { content, rating } = req.body;

  const breweryPostId = req.query.id;

  const user = req.user!;

  const newBreweryComment: z.infer<typeof CommentQueryResult> =
    await createNewBreweryComment({
      content,
      rating,
      breweryPostId,
      userId: user.id,
    });

  res.status(201).json({
    message: 'Beer comment created successfully',
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

  const comments = await getAllBreweryComments({
    id: breweryPostId,
    pageNum: parseInt(page_num, 10),
    pageSize: parseInt(page_size, 10),
  });

  const count = await DBClient.instance.breweryComment.count({
    where: { breweryPostId },
  });

  res.setHeader('X-Total-Count', count);

  res.status(200).json({
    message: 'Beer comments fetched successfully',
    statusCode: 200,
    payload: comments,
    success: true,
  });
};
