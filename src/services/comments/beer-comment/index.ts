import DBClient from '@/prisma/DBClient';

import {
  CreateBeerPostComment,
  EditBeerPostCommentById,
  FindOrDeleteBeerPostCommentById,
  GetAllBeerPostComments,
} from './types';

/**
 * The select object for retrieving beer post comments.
 *
 * @example
 *   const beerPostComments = await DBClient.instance.beerComment.findMany({
 *     select: beerPostCommentSelect,
 *   });
 */
const beerPostCommentSelect = {
  id: true,
  content: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  postedBy: {
    select: { id: true, username: true, createdAt: true, userAvatar: true },
  },
} as const;

/**
 * Creates a new comment for a beer post.
 *
 * @param params - The options for creating the comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.beerPostId - The ID of the beer post.
 * @param params.userId - The ID of the user creating the comment.
 * @returns A promise that resolves to the created beer comment.
 */
export const createBeerPostCommentService: CreateBeerPostComment = ({
  body,
  beerPostId,
  userId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerComment.create({
    data: {
      content,
      rating,
      beerPost: { connect: { id: beerPostId } },
      postedBy: { connect: { id: userId } },
    },
    select: beerPostCommentSelect,
  });
};

/**
 * Edits a comment for a beer post.
 *
 * @param params - The options for editing the comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer.
 * @param params.beerPostCommentId - The ID of the beer post comment.
 * @returns A promise that resolves to the updated beer comment.
 */
export const editBeerPostCommentByIdService: EditBeerPostCommentById = ({
  beerPostCommentId,
  body,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerComment.update({
    where: { id: beerPostCommentId },
    data: { content, rating, updatedAt: new Date() },
    select: beerPostCommentSelect,
  });
};

/**
 * Finds a comment for a beer post by ID.
 *
 * @param params - The options for finding the comment.
 * @param params.beerPostCommentId - The ID of the beer post comment.
 * @returns A promise that resolves to the found beer comment.
 */
export const getBeerPostCommentByIdService: FindOrDeleteBeerPostCommentById = ({
  beerPostCommentId,
}) => {
  return DBClient.instance.beerComment.findUnique({
    where: { id: beerPostCommentId },
    select: beerPostCommentSelect,
  });
};

/**
 * Deletes a comment for a beer post by ID.
 *
 * @param params - The options for deleting the comment.
 * @param params.beerPostCommentId - The ID of the beer post comment.
 * @returns A promise that resolves to the deleted beer comment.
 */
export const deleteBeerCommentByIdService: FindOrDeleteBeerPostCommentById = ({
  beerPostCommentId,
}) => {
  return DBClient.instance.beerComment.delete({
    where: { id: beerPostCommentId },
    select: beerPostCommentSelect,
  });
};

/**
 * Gets all comments for a beer post.
 *
 * @param params - The options for getting the comments.
 * @param params.beerPostId - The ID of the beer post.
 * @param params.pageNum - The page number of the comments.
 * @param params.pageSize - The number of comments per page.
 * @returns A promise that resolves to the found beer comments.
 */
export const getAllBeerCommentsService: GetAllBeerPostComments = async ({
  beerPostId,
  pageNum,
  pageSize,
}) => {
  const comments = await DBClient.instance.beerComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerPostId },
    orderBy: { createdAt: 'desc' },
    select: beerPostCommentSelect,
  });

  const count = await DBClient.instance.beerComment.count({ where: { beerPostId } });

  return { comments, count };
};
