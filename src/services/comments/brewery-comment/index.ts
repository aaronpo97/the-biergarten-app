import DBClient from '@/prisma/DBClient';
import {
  CreateNewBreweryComment,
  FindDeleteBreweryCommentById,
  GetAllBreweryComments,
  UpdateBreweryCommentById,
} from './types';

/**
 * The select object for retrieving brewery comments.
 *
 * @example
 *   const breweryComments = await DBClient.instance.breweryComment.findMany({
 *     select: breweryCommentSelect,
 *   });
 */
const breweryCommentSelect = {
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
 * Updates a brewery comment by ID.
 *
 * @param params - The options for updating the brewery comment.
 * @param params.breweryCommentId - The ID of the brewery comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the brewery.
 * @returns A promise that resolves to the updated brewery comment.
 */
export const updateBreweryCommentById: UpdateBreweryCommentById = ({
  breweryCommentId,
  body,
}) => {
  const { content, rating } = body;

  return DBClient.instance.breweryComment.update({
    where: { id: breweryCommentId },
    data: { content, rating },
    select: breweryCommentSelect,
  });
};

/**
 * Creates a new comment for a brewery.
 *
 * @param params - The options for creating the comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the brewery.
 * @param params.breweryPostId - The ID of the brewery post.
 * @param params.userId - The ID of the user creating the comment.
 * @returns A promise that resolves to the created brewery comment.
 */
export const createNewBreweryComment: CreateNewBreweryComment = ({
  body,
  breweryPostId,
  userId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.breweryComment.create({
    data: {
      content,
      rating,
      breweryPost: { connect: { id: breweryPostId } },
      postedBy: { connect: { id: userId } },
    },
    select: breweryCommentSelect,
  });
};

/**
 * Gets all comments for a brewery.
 *
 * @param params - The options for getting the comments.
 * @param params.breweryPostId - The ID of the brewery post.
 * @param params.pageNum - The page number of the comments.
 * @param params.pageSize - The number of comments per page.
 * @returns A promise that resolves to the retrieved brewery comments.
 */
export const getAllBreweryComments: GetAllBreweryComments = async ({
  id,
  pageNum,
  pageSize,
}) => {
  const comments = await DBClient.instance.breweryComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { breweryPostId: id },
    select: breweryCommentSelect,
    orderBy: { createdAt: 'desc' },
  });

  const count = await DBClient.instance.breweryComment.count({
    where: { breweryPostId: id },
  });

  return { comments, count };
};

/**
 * Finds a comment for a brewery post by ID.
 *
 * @param params - The options for finding the comment.
 * @param params.breweryCommentId - The ID of the brewery post comment.
 * @returns A promise that resolves to the found brewery comment.
 */
export const getBreweryCommentById: FindDeleteBreweryCommentById = ({
  breweryCommentId,
}) => {
  return DBClient.instance.breweryComment.findUnique({
    where: { id: breweryCommentId },
    select: breweryCommentSelect,
  });
};

/**
 * Deletes a comment for a brewery post by ID.
 *
 * @param params - The options for deleting the comment.
 * @param params.breweryCommentId - The ID of the brewery post comment.
 * @returns A promise that resolves to the deleted brewery comment.
 */
export const deleteBreweryCommentByIdService: FindDeleteBreweryCommentById = ({
  breweryCommentId,
}) => {
  return DBClient.instance.breweryComment.delete({
    where: { id: breweryCommentId },
    select: breweryCommentSelect,
  });
};
