import DBClient from '@/prisma/DBClient';
import {
  CreateNewBeerStyleComment,
  GetAllBeerStyleComments,
  UpdateBeerStyleCommentById,
  FindOrDeleteBeerStyleCommentById,
} from './types';

/**
 * The select object for retrieving beer style comments.
 *
 * @example
 *   const beerStyleComments = await DBClient.instance.beerStyleComment.findMany({
 *     select: beerStyleCommentSelect,
 *   });
 */
const beerStyleCommentSelect = {
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
 * Creates a new comment for a beer style.
 *
 * @param params - The options for creating the comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer style.
 * @param params.beerStyleId - The ID of the beer style.
 * @param params.userId - The ID of the user creating the comment.
 * @returns A promise that resolves to the created beer comment.
 */
export const createNewBeerStyleComment: CreateNewBeerStyleComment = ({
  body,
  userId,
  beerStyleId,
}) => {
  const { content, rating } = body;
  return DBClient.instance.beerStyleComment.create({
    data: {
      content,
      rating,
      beerStyle: { connect: { id: beerStyleId } },
      postedBy: { connect: { id: userId } },
    },
    select: beerStyleCommentSelect,
  });
};

/**
 * Gets all comments for a beer style.
 *
 * @param params - The options for getting the comments.
 * @param params.beerStyleId - The ID of the beer style.
 * @param params.pageNum - The page number of the comments.
 * @param params.pageSize - The page size of the comments.
 * @returns A promise that resolves to the beer style comments.
 */
export const getAllBeerStyleComments: GetAllBeerStyleComments = async ({
  beerStyleId,
  pageNum,
  pageSize,
}) => {
  const comments = await DBClient.instance.beerStyleComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerStyleId },
    orderBy: { createdAt: 'desc' },
    select: beerStyleCommentSelect,
  });

  const count = await DBClient.instance.beerStyleComment.count({
    where: { beerStyleId },
  });

  return { comments, count };
};

/**
 * Updates a beer style comment by ID.
 *
 * @param params - The options for updating the comment.
 * @param params.body - The body of the comment.
 * @param params.body.content - The content of the comment.
 * @param params.body.rating - The rating of the beer style.
 * @param params.beerStyleCommentId - The ID of the beer style comment.
 * @returns A promise that resolves to the updated beer comment.
 */
export const updateBeerStyleCommentById: UpdateBeerStyleCommentById = ({
  body,
  beerStyleCommentId,
}) => {
  const { content, rating } = body;

  return DBClient.instance.beerStyleComment.update({
    where: { id: beerStyleCommentId },
    data: { content, rating, updatedAt: new Date() },
    select: beerStyleCommentSelect,
  });
};

/**
 * Finds a comment for a beer style by ID.
 *
 * @param params - The options for finding the comment.
 * @param params.beerStyleCommentId - The ID of the beer style comment.
 * @returns A promise that resolves to the found beer comment.
 */
export const findBeerStyleCommentById: FindOrDeleteBeerStyleCommentById = ({
  beerStyleCommentId,
}) => {
  return DBClient.instance.beerStyleComment.findUnique({
    where: { id: beerStyleCommentId },
    select: beerStyleCommentSelect,
  });
};

/**
 * Deletes a comment for a beer style by ID.
 *
 * @param params - The options for deleting the comment.
 * @param params.beerStyleCommentId - The ID of the beer style comment.
 * @returns A promise that resolves to the deleted beer comment.
 */
export const deleteBeerStyleCommentById: FindOrDeleteBeerStyleCommentById = ({
  beerStyleCommentId,
}) => {
  return DBClient.instance.beerStyleComment.delete({
    where: { id: beerStyleCommentId },
    select: beerStyleCommentSelect,
  });
};
